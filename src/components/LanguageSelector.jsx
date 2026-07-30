import React, { useState } from 'react';
import { 
  ShieldCheck, Volume2, Lock, CheckCircle, Search, Filter, Play, 
  Sparkles, AlertCircle, RefreshCw, MapPin 
} from 'lucide-react';
import { LANGUAGES, CITIES, generateAudioScript, getDailyPanchangam } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function LanguageSelector({ idolState, onConfirmLanguage, onConfirmCity }) {
  const [selectedLang, setSelectedLang] = useState(idolState.activeLanguage);
  const [selectedCity, setSelectedCity] = useState(idolState.activeCity || 'hyderabad');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const panchang = getDailyPanchangam(selectedCity);

  // Region Filters
  const regions = ['ALL', 'South', 'North', 'East', 'West', 'North-East', 'Classical', 'Universal'];

  // Filtered Languages
  const filteredLanguages = LANGUAGES.filter(lang => {
    const matchesSearch = lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          lang.script.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = selectedRegion === 'ALL' || lang.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  const activeLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
  const confirmedLangObj = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
  const activeCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];

  // Play Test Voice Preview
  const handlePlayTestVoice = (langObj) => {
    const scriptText = generateAudioScript(langObj.id, panchang);
    setIsPlayingTest(true);
    ttsEngine.speak(scriptText, langObj.code, {
      onEnd: () => setIsPlayingTest(false),
      onError: () => setIsPlayingTest(false)
    });
  };

  const handleStopTestVoice = () => {
    ttsEngine.stop();
    setIsPlayingTest(false);
  };

  // Confirm Language & Location to ESP32
  const handleExecuteConfirmation = () => {
    setIsSyncing(true);
    setTimeout(() => {
      onConfirmLanguage(selectedLang);
      onConfirmCity(selectedCity);
      setIsSyncing(false);
      setShowConfirmModal(false);
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '8px' }}>
              <Lock size={14} /> ADMINISTRATOR CONTROL CENTER
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Idol Location & Panchangam <span className="sacred-glow-text">Language Controller</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
              Configure the exact <strong>City Location</strong> and <strong>Audio Announcement Language</strong> for the Smart Idol. The ESP32 device will play location-accurate Panchangam upon motion detection.
            </p>
          </div>

          {/* Current Confirmed Language & Location Box */}
          <div style={{ 
            padding: '16px 20px', 
            borderRadius: '12px', 
            background: 'rgba(9, 13, 22, 0.8)', 
            border: '1px solid rgba(245, 158, 11, 0.4)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>CONFIRMED ON ESP32</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <CheckCircle size={16} color="#34d399" />
              {activeCityObj.name} • {confirmedLangObj.flag} {confirmedLangObj.name}
            </div>
          </div>
        </div>
      </div>

      {/* Location Selector Card */}
      <div className="glass-card" style={{ padding: '20px 24px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <MapPin size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                Select Smart Idol Location / City
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#9ca3af', margin: '2px 0 0 0' }}>
                Coordinates & Sunrise/Sunset timings calibrate automatically based on your chosen city.
              </p>
            </div>
          </div>

          {/* City Dropdown */}
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: 'rgba(9, 13, 22, 0.95)',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              color: '#34d399',
              padding: '10px 20px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {CITIES.map((c) => (
              <option key={c.id} value={c.id}>
                📍 {c.name}, {c.state} ({c.lat}° N, {c.lon}° E)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '8px 14px', borderRadius: '10px', minWidth: '260px' }}>
          <Search size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search Indian languages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
          />
        </div>

        {/* Region Filter Buttons */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: selectedRegion === reg ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
                background: selectedRegion === reg ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedRegion === reg ? '#fbbf24' : '#9ca3af',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {reg}
            </button>
          ))}
        </div>
      </div>

      {/* Languages Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {filteredLanguages.map((lang) => {
          const isSelected = selectedLang === lang.id;
          const isConfirmed = idolState.activeLanguage === lang.id;

          return (
            <div
              key={lang.id}
              onClick={() => setSelectedLang(lang.id)}
              className="glass-card glass-card-interactive"
              style={{
                padding: '18px',
                border: isSelected 
                  ? '2px solid #f59e0b' 
                  : isConfirmed 
                  ? '1px solid rgba(16, 185, 129, 0.5)' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                background: isSelected 
                  ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(17, 24, 39, 0.9))' 
                  : 'rgba(17, 24, 39, 0.6)',
                position: 'relative'
              }}
            >
              {/* Confirmed Lock Ribbon */}
              {isConfirmed && (
                <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  <span className="badge-emerald" style={{ fontSize: '0.65rem' }}>
                    <Lock size={10} /> CONFIRMED
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <span style={{ fontSize: '2rem' }}>{lang.flag}</span>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>{lang.name}</h4>
                  <div style={{ fontSize: '0.85rem', color: '#fbbf24', fontWeight: 600 }}>{lang.script}</div>
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', color: '#9ca3af', display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '8px' }}>
                <span>Region: {lang.region}</span>
                <span>Code: {lang.code}</span>
              </div>

              {/* Action Toolbar on Card */}
              <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayTestVoice(lang);
                  }}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.75rem', justifyContent: 'center' }}
                >
                  <Play size={12} color="#fbbf24" /> Sample Voice
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Language Action Bar */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(9, 13, 22, 0.95))', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', textTransform: 'uppercase' }}>SELECTED ADMIN CHOICE</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📍 {activeCityObj.name}</span>
              <span>•</span>
              <span>{activeLangObj.flag} {activeLangObj.name}</span>
              <span style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 500 }}>({activeLangObj.script})</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', margin: '4px 0 0 0' }}>
              Sample announcement script: "{generateAudioScript(activeLangObj.id, panchang).substring(0, 75)}..."
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {/* Audio Test Button */}
            {isPlayingTest ? (
              <button className="btn-secondary" onClick={handleStopTestVoice} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
                <Volume2 size={16} /> Stop Audio Preview
              </button>
            ) : (
              <button className="btn-secondary" onClick={() => handlePlayTestVoice(activeLangObj)}>
                <Volume2 size={16} color="#fbbf24" /> Listen Audio Preview
              </button>
            )}

            {/* Confirm & Publish to ESP32 Button */}
            <button 
              className="btn-primary" 
              onClick={() => setShowConfirmModal(true)}
              style={{ padding: '12px 24px', fontSize: '0.95rem' }}
            >
              <ShieldCheck size={18} />
              Confirm {activeCityObj.name} & {activeLangObj.name} to ESP32
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' 
        }}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '28px', border: '1px solid rgba(245, 158, 11, 0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Lock size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>Confirm Idol Location & Language</h3>
            </div>

            <p style={{ color: '#d1d5db', fontSize: '0.95rem', lineHeight: '1.5' }}>
              You are locking the Smart Idol settings to <strong>📍 {activeCityObj.name}, {activeCityObj.state}</strong> in <strong>{activeLangObj.name} ({activeLangObj.script})</strong>.
            </p>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem', marginTop: '10px', background: 'rgba(255, 255, 255, 0.04)', padding: '10px', borderRadius: '8px' }}>
              ⚠️ The ESP32 device will sync this location & language over Wi-Fi and announce local Panchangam timings upon motion detection.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button className="btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleExecuteConfirmation} disabled={isSyncing}>
                {isSyncing ? (
                  <>
                    <RefreshCw size={16} className="pulse-motion" /> Syncing with ESP32...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} /> Confirm & Publish Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
