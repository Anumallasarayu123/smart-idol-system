#include <WiFi.h>
#include "Audio.h" // ESP32-AudioI2S library by schreibfaul1 (v3.3.11)

// ================== Wi-Fi Configuration ==================
const char* ssid     = "Neonflake";
const char* password = "FanSense#2023";

// ================== Direct MP3 Server Endpoint ==================
const char* AUDIO_URL = "http://192.168.31.217:3001/audio/latest.mp3";

// ================== Hardware Pin Definitions ==================j
#define PIR_PIN   13   // HC-SR501 PIR Motion Sensor OUT Pin
#define LED_PIN   2    // ESP32 Built-in Blue LED Pin
#define SD_PIN    4    // MAX98357A SD (Shutdown/Mute) Pin

// MAX98357A I2S Audio Pins
#define I2S_BCLK  26   // Bit Clock Pin ➔ GPIO 26
#define I2S_LRC   25   // WS / LRC Pin  ➔ GPIO 25
#define I2S_DOUT  27   // Serial Data Out ➔ GPIO 27

Audio audio;
unsigned long lastPlayTime = 0;
bool isPlaying = false;

// Callback when MP3 audio finishes playing
void audio_eof_mp3(const char *info) {
  Serial.println("\n✅ MP3 Playback Finished!");
  digitalWrite(SD_PIN, LOW);  // Mute MAX98357A speaker
  digitalWrite(LED_PIN, LOW); // Turn LED OFF
  isPlaying = false;
}

// Function to trigger audio playback
void playAudio() {
  Serial.println("\n⚡ [MOTION DETECTED] Human wave sensed!");
  Serial.println("🔊 Streaming http://192.168.31.217:3001/audio/latest.mp3 ...");

  digitalWrite(SD_PIN, HIGH);  // Unmute MAX98357A speaker
  digitalWrite(LED_PIN, HIGH); // Turn LED ON

  // Stream MP3 directly in ESP32 Core 3.x
  isPlaying = audio.connecttohost(AUDIO_URL);
}

// =====================================================
// Setup
// =====================================================
void setup() {
  Serial.begin(115200);

  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  pinMode(SD_PIN, OUTPUT);

  digitalWrite(SD_PIN, LOW); // Keep amp muted initially

  Serial.println("📶 Connecting to Wi-Fi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  WiFi.setSleep(false); // Maximize Wi-Fi signal power

  Serial.println("\n✅ Wi-Fi Connected!");
  Serial.print("📡 ESP32 IP: ");
  Serial.println(WiFi.localIP());

  // Configure I2S Pins for ESP32 Core 3.x
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(18); // Volume range 0 to 21 (18 = ~85% smooth volume)

  Serial.println("⏳ Warming up PIR sensor for 10 seconds...");
  delay(10000);

  Serial.println("✅ Smart Idol Ready for ESP32 Core 3.x! Wave your hand...");
}

// =====================================================
// Main Loop
// =====================================================
void loop() {
  audio.loop(); // Modern background audio decoder loop

  if (!isPlaying && digitalRead(PIR_PIN) == HIGH) {
    if (millis() - lastPlayTime > 15000) { // 15s cooldown between plays
      playAudio();
      lastPlayTime = millis();
    }
  }
}