import React, { useState } from 'react';
import { 
  Globe, Check, Volume2, ShieldCheck, Lock, Play, Sparkles, MapPin, Loader2, RefreshCw, Cpu, Layers, Disc, Music
} from 'lucide-react';
import { LANGUAGES, CITIES, generateAudioScript, getDailyPanchangam } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function LanguageSelector({ idolState, onConfirmLanguage, onConfirmCity, isSyncing }) {
  const [selectedLang, setSelectedLang] = useState(idolState.activeLanguage);
  const [selectedCity, setSelectedCity] = useState(idolState.activeCity);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTabRegion, setActiveTabRegion] = useState('ALL');

  const panchang = getDailyPanchangam(selectedCity);
  const activeLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
  const activeCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  const handlePlayTestVoice = async (langObj) => {
    await onConfirmLanguage(langObj.id);
    await onConfirmCity(selectedCity);
    const scriptText = generateAudioScript(langObj.id, panchang);
    setIsPlayingTest(true);
    ttsEngine.speak(scriptText, langObj.code, {
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false)
    });
  };

  const filteredLanguages = LANGUAGES.filter(l => {
    const matchesSearch = 
      l.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.region.toLowerCase().includes(searchFilter.toLowerCase()) ||
      l.script.toLowerCase().includes(searchFilter.toLowerCase());

    if (activeTabRegion === 'ALL') return matchesSearch;
    if (activeTabRegion === 'SOUTH') return matchesSearch && (l.id === 'telugu' || l.id === 'tamil' || l.id === 'kannada' || l.id === 'malayalam');
    if (activeTabRegion === 'NORTH') return matchesSearch && (l.id === 'hindi' || l.id === 'punjabi' || l.id === 'sanskrit');
    if (activeTabRegion === 'WEST_EAST') return matchesSearch && (l.id === 'marathi' || l.id === 'gujarati' || l.id === 'bengali' || l.id === 'oriya' || l.id === 'assamese');
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. REALISTIC HERO HEADER */}
      <div className="glass-card" style={{ padding: '28px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(15, 23, 42, 0.9))', border: '1px solid rgba(245, 158, 11, 0.35)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ea580c, #f59e0b)', padding: '14px', borderRadius: '16px', color: '#ffffff', boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)' }}>
              <Globe size={32} />
            </div>
            <div>
              <div className="badge-gold" style={{ marginBottom: '6px' }}>
                <ShieldCheck size={12} /> ALL-INDIA MULTI-LANGUAGE HARDWARE CONTROL
              </div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
                Voice Language & City Location Calibration
              </h2>
              <p style={{ color: '#9ca3af', margin: '4px 0 0 0', fontSize: '0.94rem' }}>
                Select spoken native language and temple city location. Audio is dynamically synthesized in 44.1kHz studio WAV & stored on server disk for ESP32 speaker.
              </p>
            </div>
          </div>

          {/* Current Active Badges */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div className="badge-gold" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
              <Volume2 size={16} /> VOICE: {activeLangObj.name.toUpperCase()} ({activeLangObj.nativeName})
            </div>
            <div className="badge-emerald" style={{ padding: '10px 16px', fontSize: '0.85rem' }}>
              <MapPin size={16} /> CITY: {activeCityObj.name.toUpperCase()} ({activeCityObj.state})
            </div>
          </div>
        </div>
      </div>

      {/* 2. REALISTIC CITY LOCATION SELECTOR PANEL */}
      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #3b82f6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={20} color="#60a5fa" /> Temple City Location Calibration (28 All-India Cities)
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', margin: '4px 0 0 0' }}>
              Calculates precise Drik Panchang ephemeris (Sunrise, Sunset, Rahu Kalam, Tithi) for exact latitude & longitude coordinates.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <select
              value={selectedCity}
              onChange={async (e) => {
                const newCity = e.target.value;
                setSelectedCity(newCity);
                await onConfirmCity(newCity);
              }}
              style={{
                background: '#090d16',
                border: '1px solid rgba(59, 130, 246, 0.5)',
                padding: '12px 18px',
                borderRadius: '10px',
                color: '#ffffff',
                fontSize: '0.98rem',
                fontWeight: 600,
                cursor: 'pointer',
                minWidth: '260px'
              }}
            >
              <optgroup label="South India">
                {CITIES.filter(c => ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Tamil Nadu', 'Kerala'].includes(c.state)).map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name} ({c.state})</option>
                ))}
              </optgroup>
              <optgroup label="North India">
                {CITIES.filter(c => ['Delhi NCR', 'Uttar Pradesh', 'Rajasthan', 'Punjab / Haryana', 'Jammu & Kashmir'].includes(c.state)).map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name} ({c.state})</option>
                ))}
              </optgroup>
              <optgroup label="West India">
                {CITIES.filter(c => ['Maharashtra', 'Gujarat', 'Goa'].includes(c.state)).map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name} ({c.state})</option>
                ))}
              </optgroup>
              <optgroup label="East & North-East India">
                {CITIES.filter(c => ['West Bengal', 'Odisha', 'Bihar', 'Assam'].includes(c.state)).map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name} ({c.state})</option>
                ))}
              </optgroup>
              <optgroup label="Central India">
                {CITIES.filter(c => ['Madhya Pradesh'].includes(c.state)).map(c => (
                  <option key={c.id} value={c.id}>📍 {c.name} ({c.state})</option>
                ))}
              </optgroup>
            </select>

            <button
              onClick={async () => {
                await onConfirmCity(selectedCity);
              }}
              className="btn-primary"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', padding: '12px 20px' }}
            >
              <Check size={16} /> Confirm Location
            </button>
          </div>
        </div>
      </div>

      {/* 3. SPOKEN LANGUAGE CARDS SECTION */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTabRegion('ALL')}
              style={{
                background: activeTabRegion === 'ALL' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabRegion === 'ALL' ? '#000000' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              ALL LANGUAGES (13)
            </button>

            <button
              onClick={() => setActiveTabRegion('SOUTH')}
              style={{
                background: activeTabRegion === 'SOUTH' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabRegion === 'SOUTH' ? '#000000' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              SOUTH INDIA
            </button>

            <button
              onClick={() => setActiveTabRegion('NORTH')}
              style={{
                background: activeTabRegion === 'NORTH' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabRegion === 'NORTH' ? '#000000' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              NORTH INDIA
            </button>

            <button
              onClick={() => setActiveTabRegion('WEST_EAST')}
              style={{
                background: activeTabRegion === 'WEST_EAST' ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                color: activeTabRegion === 'WEST_EAST' ? '#000000' : '#d1d5db',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              WEST & EAST INDIA
            </button>
          </div>

          <input 
            type="text"
            placeholder="🔍 Search language or native script..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            style={{
              background: '#090d16',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '10px 18px',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '0.88rem',
              width: '260px'
            }}
          />
        </div>

        {/* 13 Language Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {filteredLanguages.map((lang) => {
            const isSelected = selectedLang === lang.id;
            const isConfirmed = idolState.activeLanguage === lang.id;

            return (
              <div
                key={lang.id}
                onClick={async () => {
                  setSelectedLang(lang.id);
                  await onConfirmLanguage(lang.id);
                }}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '20px',
                  border: isConfirmed 
                    ? '2px solid #10b981' 
                    : isSelected 
                    ? '2px solid #f59e0b' 
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isConfirmed
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(17, 24, 39, 0.95))'
                    : isSelected 
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(17, 24, 39, 0.95))' 
                    : 'rgba(17, 24, 39, 0.7)',
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}
              >
                {/* Active Lock Badge */}
                {isConfirmed && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    <span className="badge-emerald" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                      <Lock size={10} /> ACTIVE DEVICE VOICE
                    </span>
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2.4rem' }}>{lang.flag}</span>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>{lang.name}</h4>
                      <div style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
                        {lang.script} ({lang.nativeName})
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    fontSize: '0.78rem', 
                    color: '#9ca3af', 
                    background: 'rgba(0, 0, 0, 0.4)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '14px'
                  }}>
                    📍 {lang.region}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setSelectedLang(lang.id);
                      await onConfirmLanguage(lang.id);
                    }}
                    className="btn-primary"
                    style={{ 
                      flex: 1, 
                      padding: '8px 12px', 
                      fontSize: '0.8rem', 
                      justifyContent: 'center',
                      background: isConfirmed 
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #f59e0b, #d97706)'
                    }}
                  >
                    <Check size={14} /> {isConfirmed ? 'Active Language' : 'Lock & Set Voice'}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayTestVoice(lang);
                    }}
                    className="btn-secondary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem', justifyContent: 'center' }}
                  >
                    <Play size={14} color="#fbbf24" /> Sample
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE SERVER AUDIO SCRIPT & AUDIO WAVEFORM SIMULATION */}
      <div className="glass-card" style={{ padding: '24px', borderLeft: '4px solid #10b981', background: 'rgba(17, 24, 39, 0.95)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Disc size={18} color="#34d399" className="spin-slow" />
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#34d399' }}>
              LIVE SERVER AUDIO ENGINE (SYNTHESIZED ON SERVER DISK)
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handlePlayTestVoice(activeLangObj)}
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Play size={14} color="#fbbf24" /> Play Audio Preview
            </button>

            <span className="badge-emerald" style={{ padding: '6px 14px' }}>
              ACTIVE: {activeLangObj.name.toUpperCase()} ({activeCityObj.name})
            </span>
          </div>
        </div>

        {/* Audio Script Text Display */}
        <p style={{
          background: '#090d16',
          padding: '16px',
          borderRadius: '10px',
          color: '#ffffff',
          fontFamily: 'serif',
          fontSize: '1.05rem',
          lineHeight: '1.6',
          margin: 0,
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}>
          "{generateAudioScript(activeLangObj.id, panchang)}"
        </p>

        {isSyncing && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', color: '#f59e0b', fontSize: '0.9rem', fontWeight: 600 }}>
            <Loader2 size={18} className="animate-spin" />
            <span>Downloading and storing 44.1kHz studio WAV audio file on server disk for ESP32 speaker...</span>
          </div>
        )}
      </div>

    </div>
  );
}
