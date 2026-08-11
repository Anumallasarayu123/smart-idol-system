#include <WiFi.h>
#include "Audio.h"

// ================== Wi-Fi Configuration ==================
const char* ssid     = "Neonflake";
const char* password = "FanSense#2023";

// ================== Server Endpoint ==================
// Using /audio/download for direct continuous MP3 streaming
const char* AUDIO_URL = "http://192.168.31.217:3001/audio/download";

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
  bool res = audio.connecttohost(AUDIO_URL);
  if (!res) {
    Serial.println("❌ Failed to start audio stream!");
    digitalWrite(LED_PIN, LOW);
    isAudioPlaying = false;
  }
}

void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SD_PIN, OUTPUT);

  digitalWrite(SD_PIN, HIGH); // Unmute MAX98357A amp
  digitalWrite(LED_PIN, LOW); // Blue LED Off

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

  // Initialize ESP32-AudioI2S Pins
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(21); // Maximum volume 21

  // Enhanced Audio Log Callback for Error Tracing
  Audio::audio_info_callback = [](Audio::msg_t m) {
    Serial.printf("🔊 [AUDIO LOG] [%s] %s\n", m.s ? m.s : "LOG", m.msg ? m.msg : "");
  };

  Serial.println("⏳ Warming up PIR sensor for 10 seconds...");
  delay(10000);

  Serial.println("✅ Smart Idol Ready! Wave your hand...");
}

void loop() {
  // MUST BE CALLED CONTINUOUSLY TO PROCESS AUDIO STREAM CHUNKS
  audio.loop();

  // Monitor active playback state
  if (audio.isRunning()) {
    isAudioPlaying = true;
  } else {
    if (isAudioPlaying) {
      Serial.println("✅ Audio finished playing!");
      digitalWrite(LED_PIN, LOW); // Turn Blue LED OFF
      isAudioPlaying = false;
    }
  }

  // Motion Detection Trigger
  if (!isAudioPlaying && digitalRead(PIR_PIN) == HIGH) {
    if (millis() - lastPlayTime > 5000) { // 5s cooldown
      triggerAudioPlayback();
      lastPlayTime = millis();
    }
  }
}