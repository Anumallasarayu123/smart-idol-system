// ESP32 C++ Arduino Firmware Code Generator with Zero IP Configuration (mDNS Hostname Auto-Discovery)

export function generateESP32Firmware({
  ssid = 'Neonflake',
  password = 'FanSense#2023',
  serverUrl = 'http://smart-idol.local:3001/motion',
  pirPin = 13,
  speakerType = 'DFPlayer',
  rxPin = 16,
  txPin = 17,
  selectedLanguage = 'hi'
}) {
  return `/*
 * ============================================================================
 *     SMART IDOL ESP32 ZERO-IP FIRMWARE (mDNS AUTOMATIC DISCOVERY)
 * ============================================================================
 * Hardware:
 *  - ESP32 Development Board
 *  - PIR Motion Sensor (HC-SR501) on GPIO ${pirPin}
 * 
 * Features:
 *  - Zero IP Configuration: Automatically connects to "http://smart-idol.local:3001/motion"
 *  - No hardcoded IP addresses needed!
 * ============================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ESPmDNS.h>

// Wi-Fi Credentials
const char* ssid     = "${ssid}";
const char* password = "${password}";

// ZERO-IP AUTOMATIC HOSTNAME ENDPOINT (No IP Address needed!)
const char* serverUrl = "http://smart-idol.local:3001/motion";

const int PIR_PIN = ${pirPin};
const int LED_PIN = 2;

int pirState = LOW;
int val = 0;

void setup() {
  Serial.begin(115200);
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);

  // Connect to Wi-Fi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(ssid);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\n✅ Wi-Fi Connected!");
  Serial.print("📡 Assigned ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Initialize mDNS Local Hostname Discovery
  if (!MDNS.begin("esp32-idol")) {
    Serial.println("[mDNS] Error setting up mDNS responder!");
  } else {
    Serial.println("[mDNS] Local Hostname Active: esp32-idol.local");
  }

  Serial.println("Warming up PIR sensor... (15 seconds)");
  delay(15000);
  Serial.println("✅ PIR Sensor Ready! Wave your hand in front of the sensor...");
}

void sendMotionToServer() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    // Uses mDNS hostname smart-idol.local without typing IP addresses!
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpCode = http.POST("{\\"motion\\":true}");
    if (httpCode > 0) {
      Serial.println("⚡ Motion signal delivered to Dashboard! Response Code: " + String(httpCode));
    } else {
      Serial.println("⚠️ HTTP Error: " + http.errorToString(httpCode));
    }
    http.end();
  }
}

void loop() {
  val = digitalRead(PIR_PIN);

  if (val == HIGH) {
    digitalWrite(LED_PIN, HIGH);
    if (pirState == LOW) {
      Serial.println("\\n⚡ [MOTION DETECTED] Human approached Smart Idol!");
      sendMotionToServer();
      pirState = HIGH;
    }
  } else {
    digitalWrite(LED_PIN, LOW);
    if (pirState == HIGH) {
      Serial.println("🟢 [IDLE] Sensor cleared.");
      pirState = LOW;
    }
  }
  delay(200);
}
`;
}
