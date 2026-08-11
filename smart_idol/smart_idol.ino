#include <WiFi.h>
#include "Audio.h" // ESP32-AudioI2S library by schreibfaul1 v3.4.x

// ================== Wi-Fi Configuration ==================
const char* ssid     = "Neonflake";
const char* password = "FanSense#2023";

// ================== Server Endpoint ==================
// Local server URL: "http://192.168.31.217:3001/audio/latest.mp3"
// Cloud Render URL: "https://smart-idol-system-2.onrender.com/audio/latest.mp3"
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

// =====================================================
// Trigger Audio Playback From Server
// =====================================================
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

// =====================================================
// Setup
// =====================================================
void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SD_PIN, OUTPUT);

  digitalWrite(SD_PIN, LOW);  // Keep amp muted initially
  digitalWrite(LED_PIN, LOW); // LED Off

  Serial.println("📶 Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  WiFi.setSleep(false); // Max Wi-Fi performance

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("📡 ESP32 Local IP: ");
  Serial.println(WiFi.localIP());

  // Initialize ESP32-AudioI2S Pins & Callbacks
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(20); // 0 to 21 volume scale

  // Register Audio Log Callback for Detailed Diagnostics
  Audio::audio_info_callback = [](Audio::msg_t m) {
    if (m.msg || m.s) {
      Serial.printf("🔊 [AUDIO] %s %s\n", m.msg ? m.msg : "", m.s ? m.s : "");
    }
  };

  Serial.println("⏳ Warming up PIR sensor for 10 seconds...");
  delay(10000);

  Serial.println("✅ Smart Idol Hardware Ready! Wave your hand...");
}

// =====================================================
// Main Loop
// =====================================================
void loop() {
  audio.loop(); // Must be called continuously in loop()

  // Detect when audio finishes playing
  if (isAudioPlaying && !audio.isRunning()) {
    Serial.println("✅ Audio playback finished!");
    digitalWrite(SD_PIN, LOW);  // Mute MAX98357A speaker amp
    digitalWrite(LED_PIN, LOW); // Turn Blue LED OFF
    isAudioPlaying = false;
  }

  // Detect PIR Motion Trigger
  if (!isAudioPlaying && digitalRead(PIR_PIN) == HIGH) {
    if (millis() - lastPlayTime > 15000) { // 15s cooldown between plays
      triggerAudioPlayback();
      lastPlayTime = millis();
    }
  }
}