# Smart Cradle: An IoT-Based Child Safety and Monitoring System

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Website](https://img.shields.io/badge/Website-Live-blue)
![EdgeImpulse](https://img.shields.io/badge/ML%20Model-Edge%20Impulse-orange)
![IoT](https://img.shields.io/badge/IoT-Enabled-lightgrey)

---

## 📌 Introduction
The **Smart Cradle** is an IoT-powered child monitoring and safety system designed to ensure the well-being of infants. It integrates **sensors, machine learning, and cloud-based visualization** to detect abnormal cradle movements, environmental conditions, and crying patterns.  

Our system continuously monitors the infant’s environment and sends alerts to caregivers in case of unsafe conditions such as:
- Abnormal shaking/tilting  
- Loud crying or continuous crying  
- Unfavorable environmental conditions (temperature, humidity, Motion, air quality)  

This helps parents and caregivers **reduce risks like overheating, unattended crying, and unsafe rocking** while ensuring a safer and more comfortable environment for infants.  

---

## 🌐 Deployed Links
- **Website (Visualization Dashboard):** [Smart Cradle Web App](https://smart-cradle-fbb4a.web.app/visualisation)  
- **Edge Impulse ML Model:** [Smart Cradle Model](https://studio.edgeimpulse.com/studio/775757)  

---

## ⚙️ Features
- Real-time monitoring of infant safety and comfort  
- Machine Learning model for classifying crying patterns  
- IoT-enabled notifications via **Blynk Cloud & Firebase**  
- Alerts through **SMS / Email / Telegram** (unsafe rocking, excessive crying, etc.)  
- Web dashboard for **live visualization** of cradle status  

---

## 🛠️ Hardware Components

| Component      | Purpose                                                                 |
|----------------|-------------------------------------------------------------------------|
| **ESP32**      | Main microcontroller with Wi-Fi, processes sensor data & triggers alerts |
| **MPU6050**    | Detects motion, tilt, and vibration (cradle movements)                  |
| **DHT11**      | Monitors temperature and humidity                                       |
| **KY-037**     | Detects high-volume crying/sounds                                       |
| **Buzzer / LED** | Provides local feedback (alerts)                                       |
| **Breadboard** | Connects components for prototyping                                     |
| **Power Supply & Wires** | Powers the system and connects components                     |

---

## 🖥️ Software Stack
- **Firmware:** ESP32 (Arduino IDE / MicroPython)  
- **ML Model:** Edge Impulse (cry detection & unsafe rocking detection)  
- **Cloud:** Firebase, Blynk Cloud  
- **Frontend:** Deployed website for visualization  

---

## 🚀 Future Enhancements
- Integration of camera module for real-time monitoring  
- Advanced ML models for emotion & gesture detection  
- Mobile app for caregiver alerts  

---

Here is the circuit diagram of the Smart Cradle system:  

![Circuit Diagram](Frontend/src/assets/wokwi.jpg)
![Prototype](Frontend/src/assets/prototype.jpg)

---

## 📊 Budget (Approx.)
| Item               | Cost (INR) |
|--------------------|-----------|
| ESP32              | ₹950      |
| MPU6050            | ₹160      |
| DHT11              | ₹90       |
| KY-037 Sound Sensor | ₹150      |
| Others (Wires, LED, Breadboard, Buzzer) | ₹260 |
| **Total**          | **₹1210** |

---

## 👨‍💻 Team
- **Sri Charan A**
- **Navaneeth A B S**  
- **Madhavan S K R**  

---

