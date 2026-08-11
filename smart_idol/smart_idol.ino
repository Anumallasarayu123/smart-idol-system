#include <WiFi.h>
#include "Audio.h" // ESP32-AudioI2S library by schreibfaul1 v3.3.11 (Fully compatible with ESP32 Core 3.2.0)

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
// Play MP3 File From Server (ESP32-AudioI2S Core 3.x)
// =====================================================
void triggerAudioPlayback() {
  Serial.println("\n⚡ [MOTION DETECTED] Human wave sensed!");
  Serial.printf("🔊 Streaming from: %s\n", AUDIO_URL);

  digitalWrite(SD_PIN, HIGH);  // Unmute MAX98357A speaker
  digitalWrite(LED_PIN, HIGH); // Turn LED ON

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) { delay(200); }
  }

  isAudioPlaying = true;
  audio.connecttohost(AUDIO_URL);
}

// Optional Audio Callbacks
void audio_info(const char *info){
  Serial.print("info        "); Serial.println(info);
}

void audio_eof_mp3(const char *info){
  Serial.println("✅ Audio finished playing!");
  digitalWrite(SD_PIN, LOW);  // Mute MAX98357A speaker
  digitalWrite(LED_PIN, LOW); // Turn LED OFF
  isAudioPlaying = false;
}

// =====================================================
// Setup
// =====================================================
void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SD_PIN, OUTPUT);

  digitalWrite(SD_PIN, LOW); // Keep amp muted

  Serial.println("📶 Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  WiFi.setSleep(false);

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("📡 ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Initialize ESP32-AudioI2S Pins
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(20); // 0 to 21 volume scale

  Serial.println("⏳ Warming up PIR sensor for 10 seconds...");
  delay(10000);

  Serial.println("✅ Smart Idol Ready! Wave your hand...");
}

// =====================================================
// Main Loop
// =====================================================
void loop() {
  audio.loop(); // Must be called continuously in loop()

  if (!isAudioPlaying && digitalRead(PIR_PIN) == HIGH) {
    if (millis() - lastPlayTime > 15000) { // 15s cooldown
      triggerAudioPlayback();
      lastPlayTime = millis();
    }
  }
}