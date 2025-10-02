#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <driver/i2s.h>
#include <smart_cradle_inferencing.h>
#include "time.h"

// --- WiFi credentials ---
#define WIFI_SSID "wifi_ssid"
#define WIFI_PASSWORD "wifi_password"

// --- Sensor Pins ---
#define DHTPIN 4
#define DHTTYPE DHT11
#define LED_PIN 2

// --- Firebase ---
#define FIREBASE_DB_URL "firebase-dburl"
#define FIREBASE_API_KEY "firebase-apikey"

// Firebase objects
FirebaseData fbData;
FirebaseAuth auth;
FirebaseConfig config;

bool signupOK = false;  // global

// --- NTP Config ---
const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 0;     // adjusted to timezone in website
const int daylightOffset_sec = 0; // adjust if DST

// --- Objects ---
Adafruit_MPU6050 mpu;
DHT dht(DHTPIN, DHTTYPE);

// --- Audio (INMP441) ---
// NOTE: Reduced buffer size to lower stack/heap pressure
#define I2S_WS   25   // LRCL
#define I2S_SD   26   // DOUT from mic
#define I2S_SCK  27   // BCLK
#define SAMPLE_RATE_AUDIO 16000
#define I2S_PORT I2S_NUM_0
#define I2S_BUFFER_SIZE 512    // <<--- reduced from 1024

float NOISE_THRESHOLD = 2000;  // adjust after testing

// --- Sampling for Edge Impulse ---
#define SAMPLE_RATE_HZ 100
static float features[EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE];
static int feature_ix = 0;

// --- Thresholds ---
float TEMP_LOW = 18.0, TEMP_HIGH = 35.0;
float HUMID_LOW = 30.0, HUMID_HIGH = 97.0;

// --- Helper: get UNIX timestamp ---
unsigned long getUnixTime() {
  time_t now;
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println(" Failed to obtain time from NTP");
    return 0;
  }
  time(&now);
  return now;
}

// ======= CHANGES TO FIX STACK OVERFLOW =======
// Move large arrays / objects to global scope so they are NOT on loop() stack:

// big audio sample buffer moved to global (was inside loop previously)
static int32_t i2s_samples[I2S_BUFFER_SIZE]; // global buffer

// Make Edge Impulse objects global to avoid allocating them on the stack
static signal_t ei_signal;                      // signal used by EI
static ei_impulse_result_t ei_result;           // result used by EI
// ==============================================

// --- I2S setup ---
void i2s_install() {
  const i2s_config_t i2s_config = {
    .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
    .sample_rate = SAMPLE_RATE_AUDIO,
    .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
    .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
    .communication_format = I2S_COMM_FORMAT_I2S,
    .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
    .dma_buf_count = 4,
    .dma_buf_len = I2S_BUFFER_SIZE,
    .use_apll = false,
    .tx_desc_auto_clear = false,
    .fixed_mclk = 0
  };
  i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
}

void i2s_setpin() {
  const i2s_pin_config_t pin_config = {
    .bck_io_num = I2S_SCK,
    .ws_io_num = I2S_WS,
    .data_out_num = -1,
    .data_in_num = I2S_SD
  };
  i2s_set_pin(I2S_PORT, &pin_config);
}

// --- Firebase push ---
void pushToFirebase(float temperature, float humidity, sensors_event_t a, sensors_event_t g,
                    String topLabel, ei_impulse_result_t &result,
                    bool anomaly_temp, bool anomaly_humid,
                    bool anomaly_motion, bool anomaly_noise, float sound_level) {

  if (!Firebase.ready() || !signupOK) {
    Serial.println("Firebase not ready, skipping push...");
    return;
  }
  unsigned long timestamp = getUnixTime();

  String path = "/cradleData/" + String(timestamp);
  FirebaseJson json;
  json.set("environment/temperature", temperature);
  json.set("environment/humidity", humidity);
  json.set("sound/level", sound_level);

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

  json.set("anomalies/overall", (anomaly_temp || anomaly_humid || anomaly_motion || anomaly_noise));
  json.set("anomalies/temperature", anomaly_temp);
  json.set("anomalies/humidity", anomaly_humid);
  json.set("anomalies/motion", anomaly_motion);
  json.set("anomalies/noise", anomaly_noise);

  json.set("timestamp_unix", (double) timestamp);

  if (!Firebase.RTDB.setJSON(&fbData, path.c_str(), &json)) {
    Serial.print("Firebase set failed: ");
    Serial.println(fbData.errorReason());
  } else {
    Serial.println("Data pushed to Firebase");
  }

  // Free any internal memory held by FirebaseJson early
  json.clear();
}

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
  Serial.println("\n Wi-Fi connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // --- Init NTP ---
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("Waiting for NTP time...");
  struct tm timeinfo;
  while (!getLocalTime(&timeinfo)) {
    Serial.println("Waiting for NTP sync...");
    delay(1000);
  }
  Serial.println("NTP time synced!");

  // --- Firebase config ---
  config.database_url = FIREBASE_DB_URL;
  config.api_key = FIREBASE_API_KEY;

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

  // --- INMP441 mic ---
  i2s_install();
  i2s_setpin();
  Serial.println("INMP441 initialized");

  // Initialize EI globals (clear / zero) to be safe:
  memset(&ei_signal, 0, sizeof(ei_signal));
  memset(&ei_result, 0, sizeof(ei_result));

  delay(100);
}

void loop() {
  static unsigned long last_sample_time = micros();
  static unsigned long last_dht_time = 0;

  static bool anomaly_temp = false;
  static bool anomaly_humid = false;
  static bool anomaly_motion = false;
  static bool anomaly_noise = false;

  static float temperature = 0;
  static float humidity = 0;

  // --- Read DHT every 2s ---
  if (millis() - last_dht_time > 2000) {
    last_dht_time = millis();
    temperature = dht.readTemperature();
    humidity = dht.readHumidity();

    Serial.print("Temp: ");
    Serial.print(temperature);
    Serial.print(" °C, Humidity: ");
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
      // Use global ei_signal and ei_result to avoid large stack usage
      numpy::signal_from_buffer(features, EI_CLASSIFIER_DSP_INPUT_FRAME_SIZE, &ei_signal);

      EI_IMPULSE_ERROR res = run_classifier(&ei_signal, &ei_result, false);

      if (res != EI_IMPULSE_OK) {
        Serial.print("ERR: ");
        Serial.println(res);
        feature_ix = 0;
        return;
      }

      String topLabel = "";
      float topValue = 0;
      for (size_t ix = 0; ix < EI_CLASSIFIER_LABEL_COUNT; ix++) {
        float val = ei_result.classification[ix].value;
        if (val > topValue) {
          topValue = val;
          topLabel = ei_result.classification[ix].label;
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

      // --- Audio Noise Detection ---
      // Use global i2s_samples buffer
      size_t bytes_read = 0;
      i2s_read(I2S_PORT, (char*)i2s_samples, sizeof(i2s_samples), &bytes_read, portMAX_DELAY);

      float avg_noise = 0.0;

      if (bytes_read > 0) {
        int num_samples = bytes_read / 4;
        long sum_abs = 0;
        for (int i = 0; i < num_samples; i++) {
          int16_t sample16 = i2s_samples[i] >> 14;
          sum_abs += abs(sample16);
        }
        avg_noise = (float)sum_abs / (float)num_samples;
        anomaly_noise = (avg_noise > NOISE_THRESHOLD);

        if (anomaly_noise) {
          Serial.println("Noise detected from cradle!");
        }
      }

      // --- Push everything to Firebase ---
      pushToFirebase(temperature, humidity, a, g, topLabel, ei_result,
                     anomaly_temp, anomaly_humid, anomaly_motion, anomaly_noise, avg_noise);

      feature_ix = 0;
    }
  }
}
