import React, { useState } from 'react';
import { 
  Sparkles, Volume2, Play, Square, Calendar, Sun, Moon, Clock, 
  BookOpen, Globe, Award, MapPin 
} from 'lucide-react';
import { getDailyPanchangam, generateAudioScript, LANGUAGES, CITIES } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function PanchangamView({ idolState, currentDate }) {
  const [selectedCity, setSelectedCity] = useState(idolState.activeCity || 'hyderabad');
  const [targetDateStr, setTargetDateStr] = useState(
    currentDate ? currentDate.toISOString().slice(0, 10) : '2026-07-28'
  );

  const selectedDate = new Date(targetDateStr);
  const panchang = getDailyPanchangam(selectedCity, selectedDate);
  const [previewLang, setPreviewLang] = useState(idolState.activeLanguage);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.95);

  const langObj = LANGUAGES.find(l => l.id === previewLang) || LANGUAGES[0];
  const audioScript = generateAudioScript(previewLang, panchang);

  const handleToggleSpeech = () => {
    if (isPlaying) {
      ttsEngine.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsEngine.speak(audioScript, langObj.code, {
        rate: speechRate,
        onEnd: () => setIsPlaying(false),
        onError: () => setIsPlaying(false)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-emerald" style={{ marginBottom: '8px' }}>
              <MapPin size={14} /> {panchang.location}
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              {panchang.dateFormatted}
            </h2>
            <p style={{ color: '#fbbf24', marginTop: '4px', fontSize: '1rem', fontWeight: 600 }}>
              {panchang.samvat} • {panchang.paksha}
            </p>
          </div>

          {/* Speaker Control Card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

      {/* Date Picker & Location Controls */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Interactive Date Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar size={18} color="#fbbf24" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>SELECT DATE TO INSPECT:</span>
          <input 
            type="date" 
            value={targetDateStr}
            onChange={(e) => setTargetDateStr(e.target.value)}
            style={{
              background: 'rgba(9, 13, 22, 0.9)',
              border: '1px solid rgba(245, 158, 11, 0.5)',
              color: '#fbbf24',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* City Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <MapPin size={18} color="#34d399" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>LOCATION:</span>
          <select 
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{
              background: 'rgba(9, 13, 22, 0.9)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              color: '#34d399',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
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

        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Globe size={18} color="#818cf8" />
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>LANGUAGE:</span>
          <select 
            value={previewLang}
            onChange={(e) => {
              setPreviewLang(e.target.value);
              if (isPlaying) ttsEngine.stop();
            }}
            style={{
              background: 'rgba(9, 13, 22, 0.9)',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              color: '#ffffff',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.flag} {l.name} ({l.script})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Generated Devotional Audio Script Box */}
      <div className="glass-card" style={{ padding: '24px', background: 'rgba(234, 88, 12, 0.06)', border: '1px dashed rgba(245, 158, 11, 0.4)' }}>
        <h4 style={{ fontSize: '0.85rem', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={16} /> Devotional Audio Speech Script ({langObj.name} • {panchang.dateFormatted})
        </h4>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.7', color: '#ffffff', fontWeight: 500, fontFamily: 'serif' }}>
          "{audioScript}"
        </p>
      </div>

      {/* Panchang 5 Limbs (Angas) Details Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        
        {/* Tithi */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>TITHI (LUNAR DAY)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24', marginTop: '6px' }}>{panchang.tithi}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>Phase: {panchang.paksha}</div>
        </div>

        {/* Nakshatra */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>NAKSHATRA (STAR)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>{panchang.nakshatra}</div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '4px' }}>Auspicious Lunar Mansion</div>
        </div>

        {/* Yoga */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>YOGA</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>{panchang.yoga}</div>
          <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '4px' }}>Luni-Solar Harmony</div>
        </div>

        {/* Karana */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>KARANA</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginTop: '6px' }}>{panchang.karana}</div>
          <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '4px' }}>Half-Tithi Period</div>
        </div>

      </div>

      {/* Timings Grid (Rahu Kalam, Yamagandam, Sunrise, Abhijit) */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={20} color="#fbbf24" />
          Location Timings & Muhurthams ({panchang.cityName})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#fca5a5', fontWeight: 700 }}>RAHU KALAM (Avoid new tasks)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444', marginTop: '4px' }}>{panchang.rahuKalam}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#fde68a', fontWeight: 700 }}>YAMAGANDAM</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>{panchang.yamagandam}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#a7f3d0', fontWeight: 700 }}>ABHIJIT MUHURTHAM (Highly Auspicious)</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>{panchang.abhijitMuhurtham}</div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c7d2fe', fontWeight: 700 }}>SUNRISE / SUNSET</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>{panchang.sunrise} / {panchang.sunset}</div>
          </div>

        </div>
      </div>

    </div>
  );
}
