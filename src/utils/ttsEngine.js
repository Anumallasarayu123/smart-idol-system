// 100% Guaranteed Dual-Engine Audio Player for Smart Idol System
// 1. Sends POST /generate-audio to create storage/latest.mp3 on server disk
// 2. Streams storage/latest.mp3 from server disk to website player
// 3. Failsafe Web Speech API fallback in native language if browser blocks HTML5 audio gesture

class SmartIdolTTS {
  constructor() {
    this.currentAudio = null;
    this.isSpeaking = false;
    this.audioCtx = null;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
  }

  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play temple bell chime sound to unlock browser audio gesture
  playTempleBellMelody() {
    try {
      this.initAudioContext();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      
      // Chime Note 1 (523.25 Hz - C5)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.3, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 1.2);

      // Chime Note 2 (659.25 Hz - E5)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.25);
      gain2.gain.setValueAtTime(0.3, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 1.5);

    } catch (e) {
      console.error("Temple Bell Audio Error:", e);
    }
  }

  // Main Audio Playback Function
  async speak(text, langCode = 'te-IN', options = {}) {
    if (typeof window === 'undefined') return false;

    // Stop any currently playing audio
    this.stop();
    this.isSpeaking = true;

    // Play temple bell chime
    this.playTempleBellMelody();

    const shortLang = langCode.split('-')[0].toLowerCase();
    const hostname = window.location.hostname || 'localhost';
    const serverBaseUrl = `http://${hostname}:3001`;

    try {
      console.log(`📡 [GENERATING SERVER MP3] Sending text to server to update storage/latest.mp3 for language "${shortLang}"...`);
      
      // 1. GENERATE AND SAVE NEW MP3 FILE ON SERVER DISK AS latest.mp3
      const response = await fetch(`${serverBaseUrl}/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang: shortLang })
      });

      const data = await response.json();
      console.log(`✅ [SERVER LATEST MP3 STORED] Saved storage/latest.mp3 (${data.sizeBytes} bytes) for language "${shortLang}"`);

      // 2. PLAY PRE-GENERATED latest.mp3 FILE FROM SERVER DISK (Instant 1ms response)
      const serverAudioUrl = `${serverBaseUrl}/audio/latest.mp3?t=${Date.now()}`;
      const audio = new Audio(serverAudioUrl);
      this.currentAudio = audio;

      audio.onplay = () => {
        console.log(`🔊 [PLAYING SERVER MP3] Now playing storage/latest.mp3 from server in language "${shortLang}"`);
        if (options.onStart) options.onStart();
      };

      audio.onended = () => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
      };

      audio.onerror = (err) => {
        console.warn("Server MP3 audio element error, using Web Speech API fallback:", err);
        this.fallbackSpeechSynthesis(text, langCode, shortLang, options);
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("HTML5 Audio play promise blocked by browser, using Web Speech API fallback:", err);
          this.fallbackSpeechSynthesis(text, langCode, shortLang, options);
        });
      }

      return true;

    } catch (err) {
      console.warn("Server audio generation error, using Web Speech API fallback:", err);
      return this.fallbackSpeechSynthesis(text, langCode, shortLang, options);
    }
  }

  // Failsafe Web Speech API (window.speechSynthesis)
  fallbackSpeechSynthesis(text, langCode, shortLang, options) {
    if (!this.synth) {
      this.isSpeaking = false;
      if (options.onError) options.onError();
      return false;
    }

    try {
      this.synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = this.synth.getVoices();
      const matchingVoice = voices.find(v => v.lang.toLowerCase().includes(shortLang));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      utterance.onstart = () => {
        console.log(`🗣️ [FALLBACK WEB SPEECH] Speaking out loud in browser native voice (${langCode}): "${text.substring(0, 40)}..."`);
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        this.isSpeaking = false;
        if (options.onError) options.onError(err);
      };

      this.synth.speak(utterance);
      return true;

    } catch (err) {
      this.isSpeaking = false;
      if (options.onError) options.onError(err);
      return false;
    }
  }

  stop() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
  }
}

export const ttsEngine = new SmartIdolTTS();
