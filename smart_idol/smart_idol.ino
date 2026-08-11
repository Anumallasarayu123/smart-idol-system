#include <WiFi.h>
#include "Audio.h"

// ================== Wi-Fi Configuration ==================
const char* ssid     = "Neonflake";
const char* password = "FanSense#2023";

// ================== Server Endpoint ==================
const char* AUDIO_URL = "http://192.168.31.217:3001/audio/latest.mp3";

// ================== Hardware Pin Definitions ==================
#define PIR_PIN   13   // HC-SR501 PIR Motion Sensor OUT Pin
#define LED_PIN   2    // ESP32 Built-in Blue LED Pin
#define SD_PIN    4    // MAX98357A SD (Shutdown/Mute) Pin

// MAX98357A I2S Audio Pins
#define I2S_BCLK  26   // Bit Clock Pin ➔ GPIO 26
#define I2S_LRC   25   // WS / LRC Pin  ➔ GPIO 25
#define I2S_DOUT  27   // Serial Data Out ➔ GPIO 27

Audio audio;
bool isAudioPlaying = false;
unsigned long lastPlayTime = 0;

// Test direct TCP Socket connection to Port 3001
void testSocketConnection() {
  Serial.println("\n📡 [DIAGNOSTIC TEST] Testing direct TCP socket connection to 192.168.31.217:3001...");
  WiFiClient client;
  client.setTimeout(3);

  if (client.connect("192.168.31.217", 3001)) {
    Serial.println("✅ TCP SOCKET CONNECTED SUCCESSFULLY TO PORT 3001!");
    client.println("GET /audio/latest.mp3 HTTP/1.1");
    client.println("Host: 192.168.31.217");
    client.println("Connection: close");
    client.println();
    
    unsigned long start = millis();
    int bytesReceived = 0;
    while (client.connected() && millis() - start < 2000) {
      while (client.available()) {
        char c = client.read();
        if (bytesReceived < 200) Serial.write(c); // Print first 200 bytes of response header
        bytesReceived++;
      }
    }
    Serial.printf("\n📊 Total bytes received from /audio/latest.mp3: %d bytes\n\n", bytesReceived);
    client.stop();
  } else {
    Serial.println("❌ COULD NOT CONNECT TCP SOCKET TO 192.168.31.217:3001!");
    Serial.println("👉 CHECK: Is Windows Firewall blocking Port 3001? Is your PC IP 192.168.31.217?\n");
  }
}

void triggerAudioPlayback() {
  Serial.println("\n⚡ [MOTION DETECTED] Human wave sensed!");
  Serial.printf("🔊 Connecting to: %s\n", AUDIO_URL);

  digitalWrite(SD_PIN, HIGH);  // Unmute MAX98357A speaker amp
  digitalWrite(LED_PIN, HIGH); // Turn Blue LED ON

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { delay(200); }
  }

  isAudioPlaying = true;
  audio.connecttohost(AUDIO_URL);
}

void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SD_PIN, OUTPUT);

  digitalWrite(SD_PIN, HIGH); // Keep amp unmuted
  digitalWrite(LED_PIN, LOW); // LED Off

  Serial.println("📶 Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  WiFi.setSleep(false);

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("📡 ESP32 Local IP: ");
  Serial.println(WiFi.localIP());

  // Run Socket Connection Diagnostic
  testSocketConnection();

  // Initialize ESP32-AudioI2S Pins
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(21); // Maximum volume 21

  Audio::audio_info_callback = [](Audio::msg_t m) {
    if (m.msg || m.s) {
      Serial.printf("🔊 [AUDIO LOG] %s: %s\n", m.msg ? m.msg : "", m.s ? m.s : "");
    }
  };

  Serial.println("⏳ Warming up PIR sensor for 10 seconds...");
  delay(10000);

  Serial.println("✅ Smart Idol Ready! Wave your hand...");
}

void loop() {
  // Check if audio finished playing
  if (isAudioPlaying && !audio.isRunning()) {
    Serial.println("✅ Audio playback finished!");
    digitalWrite(LED_PIN, LOW); // Turn Blue LED OFF
    isAudioPlaying = false;
  }

  // Detect PIR Motion Trigger
  if (!isAudioPlaying && digitalRead(PIR_PIN) == HIGH) {
    if (millis() - lastPlayTime > 10000) { // 10s cooldown
      triggerAudioPlayback();
      lastPlayTime = millis();
    }
  }

  delay(20);
}