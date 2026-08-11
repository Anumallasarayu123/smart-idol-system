import React, { useState } from 'react';
import { 
  Activity, Wifi, Volume2, ShieldCheck, Clock, 
  CheckCircle2, ArrowUpRight, Cpu, Layers, MapPin, Download, RefreshCw, Disc, Square, Save, Zap, Sparkles
} from 'lucide-react';
import { LANGUAGES, CITIES, getDailyPanchangam, generateAudioScript } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function DashboardOverview({ idolState, onNavigateToTab, onTriggerMotion }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUpdatingServer, setIsUpdatingServer] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [serverMessage, setServerMessage] = useState(null);

  const currentLang = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
  const currentCity = CITIES.find(c => c.id === idolState.activeCity) || CITIES[0];
  const panchang = getDailyPanchangam(idolState.activeCity);
  const audioScriptText = generateAudioScript(currentLang.id, panchang);

  // Dedicated Action: Update Language & Location Audio in Server
  const handleUpdateLanguageInServer = async () => {
    setIsUpdatingServer(true);
    setServerMessage(null);

    try {
      const hostname = window.location.hostname || 'localhost';
      const serverBaseUrl = `http://${hostname}:3001`;

      const response = await fetch(`${serverBaseUrl}/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: audioScriptText, 
          lang: currentLang.code.split('-')[0],
          city: currentCity.id
        })
      });

      const data = await response.json();
      if (data.status === 'ok') {
        setServerMessage(`✅ Server audio updated for ${currentCity.name} in ${currentLang.flag} ${currentLang.name}! Saved as storage/latest.mp3 & storage/latest.wav`);
        handlePlayServerAudioPreview();
      } else {
        setServerMessage(`⚠️ Server update failed: ${data.message}`);
      }
    } catch (err) {
      console.error("Server update error:", err);
      setServerMessage("⚠️ Server connection error. Make sure server is running on Port 3001.");
    } finally {
      setIsUpdatingServer(false);
    }
  };

  const handleDownloadAudio = async () => {
    setIsDownloading(true);

    try {
      const hostname = window.location.hostname || 'localhost';
      const serverBaseUrl = `http://${hostname}:3001`;

      const genRes = await fetch(`${serverBaseUrl}/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: audioScriptText, 
          lang: currentLang.code.split('-')[0],
          city: currentCity.id
        })
      });
      const data = await genRes.json();

      if (data.status === 'ok') {
        const audioRes = await fetch(`${serverBaseUrl}/audio/latest.mp3?t=${Date.now()}`);
        const blob = await audioRes.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Panchangam_${currentCity.name}_${currentLang.name}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Audio download error:", err);
      const hostname = window.location.hostname || 'localhost';
      window.open(`http://${hostname}:3001/audio/download`, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePlayServerAudioPreview = () => {
    if (isPlayingPreview) {
      ttsEngine.stop();
      setIsPlayingPreview(false);
    } else {
      setIsPlayingPreview(true);
      ttsEngine.speak(audioScriptText, currentLang.code, {
        onEnd: () => setIsPlayingPreview(false),
        onError: () => setIsPlayingPreview(false)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* REALISTIC LORD GANESHA HERO SHRINE SHOWCASE BANNER */}
      <div className="glass-card" style={{ 
        padding: '0', 
        overflow: 'hidden',
        border: '1px solid rgba(245, 158, 11, 0.35)', 
        background: 'linear-gradient(135deg, rgba(26, 18, 9, 0.95), rgba(10, 13, 20, 0.98))' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0' }}>
          
          {/* Left Text & Controls Area */}
          <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div className="badge-gold" style={{ marginBottom: '12px', width: 'fit-content' }}>
              <ShieldCheck size={14} /> LORD GANESHA SMART IDOL SHRINE v2.5
            </div>
            
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.2 }}>
              Smart Lord Ganesha <span className="sacred-glow-text">Panchangam Shrine</span>
            </h1>
            
            <p style={{ color: '#9ca3af', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 24px 0' }}>
              Next-generation IoT devotional shrine powered by ESP32 micro-controller, HC-SR501 PIR human motion sensor, MAX98357A I2S 44.1kHz studio audio DAC, and All-India multi-language ephemeris engine.
            </p>

            {/* Quick Action Toolbar */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button 
                onClick={handleUpdateLanguageInServer}
                disabled={isUpdatingServer}
                className="btn-primary"
                style={{ 
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)', 
                  color: '#000000',
                  fontWeight: 700,
                  border: 'none', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  cursor: isUpdatingServer ? 'wait' : 'pointer',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.45)'
                }}
              >
                {isUpdatingServer ? (
                  <>
                    <RefreshCw size={16} className="pulse-motion" /> Updating Server Audio...
                  </>
                ) : (
                  <>
                    <Save size={16} /> 🔄 Sync Language & Location to Server Audio
                  </>
                )}
              </button>

              <button 
                onClick={handlePlayServerAudioPreview}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isPlayingPreview ? <Square size={16} /> : <Volume2 size={16} />}
                {isPlayingPreview ? 'Pause Audio' : `🔊 Listen Audio (${currentLang.flag} ${currentLang.name})`}
              </button>

              <button 
                onClick={onTriggerMotion}
                className="btn-primary"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Zap size={16} /> ⚡ Test Motion Detection Trigger
              </button>
            </div>
          </div>

          {/* Right Realistic Ganesha Image Showcase (HTTP RELATIVE PUBLIC PATH) */}
          <div style={{ 
            position: 'relative', 
            minHeight: '300px',
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}>
            <img 
              src="/realistic_ganesha_idol.jpg" 
              alt="Lord Ganesha Smart Idol Shrine" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.95,
                filter: 'contrast(1.08) brightness(1.02)'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(0, 0, 0, 0.78)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              borderRadius: '10px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justify: 'space-between',
              fontSize: '0.82rem',
              color: '#fbbf24'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} />
                <span style={{ fontWeight: 700 }}>LORD GANESHA SMART IDOL SHRINE</span>
              </div>
              <span style={{ color: '#34d399', fontWeight: 600 }}>PIR SENSOR: ACTIVE</span>
            </div>
          </div>

        </div>

        {/* Server Success Toast Notification */}
        {serverMessage && (
          <div style={{
            margin: '16px 24px 24px 24px',
            padding: '12px 16px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid #10b981',
            color: '#34d399',
            fontWeight: 600,
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={18} />
            <span>{serverMessage}</span>
          </div>
        )}
      </div>

      {/* Live Server Active Audio Script Banner */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <Disc size={16} className="spin-slow" /> ACTIVE SERVER AUDIO SCRIPT (SPOKEN BY ESP32 SPEAKER)
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge-emerald" style={{ fontSize: '0.75rem' }}>
              📍 {currentCity.name}, {currentCity.state}
            </span>
            <span className="badge-gold" style={{ fontSize: '0.75rem' }}>
              {currentLang.flag} {currentLang.name} ({currentLang.script})
            </span>
          </div>
        </div>
        <p style={{ color: '#ffffff', fontSize: '1.08rem', margin: 0, lineHeight: 1.5, fontWeight: 500, fontFamily: 'serif' }}>
          "{audioScriptText}"
        </p>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Confirmed City & Language */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>CALIBRATED CITY LOCATION</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.15)', color: '#fbbf24' }}>
              <MapPin size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
            📍 {currentCity.name}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
            {currentCity.state} ({currentLang.flag} {currentLang.name})
          </div>
        </div>

        {/* Metric 2: Motion Triggers Today */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>DEVOTEE MOTION TRIGGERS</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff' }}>
            {idolState.totalTriggersToday}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +12% vs Yesterday • PIR Active
          </div>
        </div>

        {/* Metric 3: Device Wi-Fi & RSSI */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>ESP32 WI-FI SIGNAL</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <Wifi size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            {idolState.wifiRssi} dBm
          </div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '4px' }}>
            {idolState.wifiSsid} ({idolState.ipAddress})
          </div>
        </div>

        {/* Metric 4: System Uptime */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>AUDIO ENGINE CODEC</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff' }}>
            44.1 kHz PCM
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f472b6', marginTop: '4px' }}>
            16-Bit Mono Studio WAV
          </div>
        </div>

      </div>

      {/* Main Stats & Hardware Circuit Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Panchangam Snapshot Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="#f59e0b" /> Today's Panchangam Snapshot
            </h3>
            <span className="badge-gold" style={{ fontSize: '0.75rem' }}>{panchang.dateFormatted.split(',')[0]}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Calibrated City Location</span>
              <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>{currentCity.name}, {currentCity.state}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Tithi (Lunar Day)</span>
              <span style={{ color: '#34d399', fontWeight: 700, fontSize: '0.92rem' }}>{panchang.tithiTe || panchang.tithiEn}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Nakshatra (Mansion)</span>
              <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.92rem' }}>{panchang.nakshatraTe || panchang.nakshatraEn}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Rahu Kalam</span>
              <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.92rem' }}>{panchang.rahuKalam}</span>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.04)', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.88rem' }}>Sunrise / Sunset</span>
              <span style={{ color: '#818cf8', fontWeight: 700, fontSize: '0.92rem' }}>{panchang.sunrise} / {panchang.sunset}</span>
            </div>
          </div>
        </div>

        {/* Realistic Hardware Circuit Diagram Card (HTTP RELATIVE PUBLIC PATH) */}
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 24px 12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={18} color="#10b981" /> ESP32 Circuit & Hardware Wiring
            </h3>
            <span className="badge-emerald" style={{ fontSize: '0.75rem' }}>CONNECTED</span>
          </div>

          <div style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src="/realistic_esp32_circuit.jpg" 
              alt="ESP32 Realistic Circuit Setup"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <div style={{ padding: '16px 24px 20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#9ca3af' }}>PIR Motion Sensor (HC-SR501):</span>
              <strong style={{ color: '#ffffff' }}>GPIO 13 (Signal)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#9ca3af' }}>I2S Audio DAC (MAX98357A):</span>
              <strong style={{ color: '#ffffff' }}>GPIO 25(LRCK), 26(BCLK), 27(DIN)</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#9ca3af' }}>Precision RTC Clock (DS3231):</span>
              <strong style={{ color: '#ffffff' }}>GPIO 21(SDA), 22(SCL)</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
