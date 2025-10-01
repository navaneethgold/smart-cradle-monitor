#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <smart_cradle_inferencing.h>

// --- WiFi credentials ---
#define WIFI_SSID "wifi_ssid"
#define WIFI_PASSWORD "wifi_password"

// --- Sensor Pins ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define LED_PIN 2

// --- Firebase ---
#define FIREBASE_DB_URL "firebase_dburl"
#define FIREBASE_API_KEY "firebase_apikey"

// Firebase objects
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;  // global

// --- Objects ---
Adafruit_MPU6050 mpu;
DHT dht(DHTPIN, DHTTYPE);

// Sampling rate (must match training)
#define SAMPLE_RATE_HZ 100

// Feature buffer
static float features[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];
static int feature_ix = 0;

// Thresholds
float TEMP_LOW = 18.0, TEMP_HIGH = 35.0;
float HUMID_LOW = 30.0, HUMID_HIGH = 85.0;

void setup() {
  Serial.begin(115200);
  Serial.println("Initializing Child cradle monitoring system...");

  pinMode(LED_PIN, OUTPUT);

  // --- Wi-Fi connection ---
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\n✅ Wi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // --- Firebase config ---
  config.database_url = FIREBASE_DB_URL;
  config.api_key = FIREBASE_API_KEY;

  // Email/password auth
  auth.user.email = "esp32@test.com";
  auth.user.password = "123456";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  signupOK = true; 

  // --- DHT sensor ---
  dht.begin();

  // --- MPU6050 sensor ---
  if (!mpu.begin()) {
    Serial.println("Failed to initialize MPU6050!");
    while (1) delay(10);
  }

  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);

  delay(100);
}


void pushToFirebase(float temperature, float humidity, sensors_event_t a, sensors_event_t g, String topLabel, ei_impulse_result_t result, bool anomaly_temp, bool anomaly_humid, bool anomaly_motion) {
  if (!Firebase.ready() || !signupOK) {
    Serial.println("Firebase not ready, skipping push...");
    return;
  }

  String path = "/cradleData/" + String(millis());
  FirebaseJson json;
  json.set("environment/temperature", temperature);
  json.set("environment/humidity", humidity);

  json.set("motion/acc_x", a.acceleration.x);
  json.set("motion/acc_y", a.acceleration.y);
  json.set("motion/acc_z", a.acceleration.z);

  json.set("motion/gyro_x", g.gyro.x);
  json.set("motion/gyro_y", g.gyro.y);
  json.set("motion/gyro_z", g.gyro.z);

  json.set("motion/state", topLabel);
  json.set("motion/confidence/idle", result.classification[0].value);
  json.set("motion/confidence/normal", result.classification[1].value);
  json.set("motion/confidence/shake", result.classification[2].value);
  json.set("motion/confidence/tilt", result.classification[3].value);

  json.set("anomalies/overall", (anomaly_temp || anomaly_humid || anomaly_motion));
  json.set("anomalies/temperature", anomaly_temp);
  json.set("anomalies/humidity", anomaly_humid);
  json.set("anomalies/motion", anomaly_motion);

  json.set("timestamp_unix", (double) millis());

  if (!Firebase.RTDB.setJSON(&fbData, path.c_str(), &json)) {
    Serial.print("Firebase set failed: ");
    Serial.println(fbData.errorReason());
  } else {
    Serial.println("Pushed data to Firebase");
  }
}

void loop() {
  static unsigned long last_sample_time = micros();
  static unsigned long last_dht_time = 0;

  static bool anomaly_temp = false;
  static bool anomaly_humid = false;
  static bool anomaly_motion = false;

  static float temperature = 0;
  static float humidity = 0;

  // --- Read DHT every 2s ---
  if (millis() - last_dht_time > 2000) {
    last_dht_time = millis();
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();

    Serial.print("Temp: ");
    Serial.print(temperature);
    Serial.print(" °C, ");
    Serial.print("Humidity: ");
    Serial.println(humidity);

    anomaly_temp = (temperature < TEMP_LOW || temperature > TEMP_HIGH);
    anomaly_humid = (humidity < HUMID_LOW || humidity > HUMID_HIGH);
  }

  // --- Read MPU + push into inference buffer ---
  if ((micros() - last_sample_time) >= (1000000UL / SAMPLE_RATE_HZ)) {
    last_sample_time += (1000000UL / SAMPLE_RATE_HZ);

    sensors_event_t a, g, t;
    mpu.getEvent(&a, &g, &t);

    features[feature_ix++] = a.acceleration.x;
    features[feature_ix++] = a.acceleration.y;
    features[feature_ix++] = a.acceleration.z;
    features[feature_ix++] = g.gyro.x;
    features[feature_ix++] = g.gyro.y;
    features[feature_ix++] = g.gyro.z;

    if (feature_ix >= EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE) {
      signal_t signal;
      numpy::signal_from_buffer(features, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &signal);

      ei_impulse_result_t result;
      EI_IMPULSE_ERROR res = run_classifier(&signal, &result, false);

      if (res != EI_IMPULSE_OK) {
        Serial.print("ERR: ");
        Serial.println(res);
        feature_ix = 0;
        return;
      }

      String topLabel = "";
      float topValue = 0;
      for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
        float val = result.classification[ix].value;
        if (val > topValue) {
          topValue = val;
          topLabel = result.classification[ix].label;
        }
      }

      Serial.print("Prediction: ");
      Serial.print(topLabel);
      Serial.print(" (");
      Serial.print(topValue * 100, 1);
      Serial.println("%)");

      if (topLabel == "unsafe_shake" || topLabel == "unsafe_tilt") {
        anomaly_motion = true;
        digitalWrite(LED_PIN, HIGH);
      } else {
        anomaly_motion = false;
        digitalWrite(LED_PIN, LOW);
      }

      pushToFirebase(temperature, humidity, a, g, topLabel, result, anomaly_temp, anomaly_humid, anomaly_motion);

      feature_ix = 0;
    }
  }
}
