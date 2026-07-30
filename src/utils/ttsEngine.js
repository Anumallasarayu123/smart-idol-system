// Guaranteed Audio & Speech Synthesis Engine for Smart Idol (With Strict Busy Lock)

class SmartIdolTTS {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.voices = [];
    this.isSpeaking = false;
    this.audioCtx = null;

    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
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

  // Play a clear temple bell chime sequence
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

  speak(text, langCode = 'te-IN', options = {}) {
    if (typeof window === 'undefined') return false;

    // STRICT BUSY LOCK: If audio speech is already playing, IGNORE ANY NEW TRIGGERS!
    if (this.isSpeaking) {
      console.log("⏳ Speech is currently active. Ignoring duplicate motion trigger.");
      return false;
    }

    this.isSpeaking = true;
    this.initAudioContext();

    // 1. Play temple bell chime sound
    this.playTempleBellMelody();

    // 2. Play Web Speech API speech
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();

      const utterance = new SpeechSynthesisUtterance(text);
      
      this.loadVoices();
      if (this.voices && this.voices.length > 0) {
        const prefix = langCode.split('-')[0].toLowerCase();
        const voice = this.voices.find(v => v.lang.toLowerCase().startsWith(prefix)) || 
                      this.voices.find(v => v.lang.toLowerCase().includes('in')) || 
                      this.voices[0];
        if (voice) {
          utterance.voice = voice;
        }
      }

      utterance.lang = langCode;
      utterance.rate = options.rate || 0.95;
      utterance.volume = 1.0;

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (options.onStart) options.onStart();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
      };

      utterance.onerror = (err) => {
        console.error("Speech Synthesis Error:", err);
        this.isSpeaking = false;
        if (options.onError) options.onError(err);
      };

      setTimeout(() => {
        window.speechSynthesis.speak(utterance);
      }, 400);
    } else {
      // Fallback reset if no SpeechSynthesis
      setTimeout(() => {
        this.isSpeaking = false;
        if (options.onEnd) options.onEnd();
      }, 8000);
    }

    return true;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

export const ttsEngine = new SmartIdolTTS();
