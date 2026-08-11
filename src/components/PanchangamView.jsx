import React, { useState } from 'react';
import { 
  Sparkles, Volume2, Square, Calendar, MapPin, Download, RefreshCw, Globe 
} from 'lucide-react';
import { getDailyPanchangam, generateAudioScript, getLocalizedPanchangFields, LANGUAGES, CITIES } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function PanchangamView({ idolState, currentDate }) {
  const [selectedCity, setSelectedCity] = useState(idolState.activeCity || 'hyderabad');
  const [previewLang, setPreviewLang] = useState(idolState.activeLanguage || 'telugu');
  const [targetDateStr, setTargetDateStr] = useState(
    currentDate ? currentDate.toISOString().slice(0, 10) : '2026-08-06'
  );

  const selectedDate = new Date(targetDateStr);
  const panchang = getDailyPanchangam(selectedCity, selectedDate);
  const localizedPanchang = getLocalizedPanchangFields(panchang, previewLang);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const langObj = LANGUAGES.find(l => l.id === previewLang) || LANGUAGES[0];
  const cityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];
  const audioScript = generateAudioScript(previewLang, panchang);

  const handleToggleSpeech = () => {
    if (isPlaying) {
      ttsEngine.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsEngine.speak(audioScript, langObj.code, {
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
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
          text: audioScript, 
          lang: langObj.code.split('-')[0],
          city: selectedCity
        })
      });
      const data = await genRes.json();

      if (data.status === 'ok') {
        const audioRes = await fetch(`${serverBaseUrl}/audio/latest.mp3?t=${Date.now()}`);
        const blob = await audioRes.blob();

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `Panchangam_${cityObj.name}_${langObj.name}.mp3`;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-emerald" style={{ marginBottom: '8px' }}>
              <MapPin size={14} /> {cityObj.name}, {cityObj.state}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              {panchang.dateFormatted}
            </h2>
            <p style={{ color: '#fbbf24', marginTop: '4px', fontSize: '1rem', fontWeight: 600 }}>
              Drik Ephemeris Panchangam for {cityObj.name}
            </p>
          </div>

          {/* Speaker & Download Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleDownloadAudio}
              disabled={isDownloading}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', padding: '12px 20px', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: isDownloading ? 'wait' : 'pointer' }}
            >
              {isDownloading ? (
                <>
                  <RefreshCw size={16} className="pulse-motion" /> Generating & Downloading...
                </>
              ) : (
                <>
                  <Download size={16} /> Download Audio ({langObj.flag} {langObj.name})
                </>
              )}
            </button>

            <button 
              className="btn-primary" 
              onClick={handleToggleSpeech}
              style={{ padding: '12px 24px', fontSize: '1rem' }}
            >
              {isPlaying ? <Square size={18} /> : <Volume2 size={18} />}
              {isPlaying ? 'Stop Speech' : `Speak in ${langObj.name}`}
            </button>
          </div>
        </div>
      </div>

      {/* Date Picker, Location, & Language Controls Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Interactive Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#fbbf24" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>CALENDAR DATE:</span>
          <input 
            type="date" 
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            style={{
              background: '#090d16',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* Location Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="#34d399" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>CITY LOCATION:</span>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: '#090d16',
              border: '1px solid rgba(52, 211, 153, 0.5)',
              color: '#34d399',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name}, {c.state}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={18} color="#60a5fa" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>PANCHANAGAM LANGUAGE:</span>
          <select
            value={previewLang}
            onChange={(e) => setPreviewLang(e.target.value)}
            style={{
              background: '#090d16',
              border: '1px solid rgba(96, 165, 250, 0.5)',
              color: '#60a5fa',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Spoken Text Script Card */}
      <div className="glass-card" style={{ padding: '20px', background: 'rgba(17, 24, 39, 0.7)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> TODAY'S SPOKEN PANCHANGAM SCRIPT ({langObj.flag} {langObj.name})
        </div>
        <p style={{ fontSize: '1.08rem', color: '#ffffff', lineHeight: '1.6', margin: 0, fontWeight: 500, fontFamily: 'serif' }}>
          "{audioScript}"
        </p>
      </div>

      {/* Grid of 5 Principal Elements (Pancha-Angas) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        
        {/* Element 1: Tithi */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>1. TITHI (LUNAR DAY)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
            {localizedPanchang.tithi}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px' }}>
            Lunar Phase
          </div>
        </div>

        {/* Element 2: Nakshatra */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>2. NAKSHATRA (STAR)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
            {localizedPanchang.nakshatra}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '4px' }}>
            Lunar Mansion
          </div>
        </div>

        {/* Element 3: Yoga */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>3. YOGA (LUNI-SOLAR ASPECT)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
            {localizedPanchang.yoga}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '4px' }}>
            Auspicious Energy
          </div>
        </div>

        {/* Element 4: Karana */}
        <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #ec4899' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>4. KARANA (HALF-TITHI)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>
            {localizedPanchang.karana}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f472b6', marginTop: '4px' }}>
            Action Period
          </div>
        </div>

      </div>

    </div>
  );
}
