import React from 'react';
import { 
  Activity, Wifi, Battery, Volume2, ShieldCheck, Radio, Clock, 
  CheckCircle2, ArrowUpRight, Cpu, Layers, MapPin 
} from 'lucide-react';
import { LANGUAGES, CITIES, getDailyPanchangam } from '../utils/panchangamEngine';
import { HOURLY_MOTION_DATA } from '../mockData/idolState';

export default function DashboardOverview({ idolState, onNavigateToTab, onTriggerMotion }) {
  const currentLang = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
  const currentCity = CITIES.find(c => c.id === idolState.activeCity) || CITIES[0];
  const panchang = getDailyPanchangam(idolState.activeCity);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Welcome Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(17, 24, 39, 0.8))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '8px' }}>
              <ShieldCheck size={14} /> ADMINISTRATOR CONTROL DASHBOARD
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Smart Idol <span className="sacred-glow-text">System Performance & Status</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
              Real-time monitoring for ESP32 motion triggers, active city location calibration, and Panchangam audio language configuration.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => onNavigateToTab('language')}>
              <ShieldCheck size={16} /> Location & Language Setup
            </button>
            <button className="btn-secondary" onClick={() => onNavigateToTab('simulator')}>
              <Radio size={16} /> Open Simulator
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Metric 1: Confirmed City & Language */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>CONFIRMED LOCATION & LANG</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.15)', color: '#fbbf24' }}>
              <MapPin size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📍 {currentCity.name}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#f59e0b', marginTop: '4px', fontWeight: 600 }}>
            {currentLang.flag} {currentLang.name} ({currentLang.script})
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

        {/* Metric 4: Battery & Power Source */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>BATTERY & POWER</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Battery size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff' }}>
            {idolState.batteryPercentage}% ({idolState.batteryVoltage})
          </div>
          <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '4px' }}>
            {idolState.powerSource}
          </div>
        </div>

      </div>

      {/* Grid Section: Live PIR Motion State + Panchang Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Idol Motion State Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Radio size={20} color="#f59e0b" />
            Live PIR Motion Sensor Status
          </h3>

          <div style={{ 
            padding: '20px', 
            borderRadius: '12px', 
            background: idolState.pirState === 'MOTION_DETECTED' || idolState.pirState === 'ANNOUNCING'
              ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.25), rgba(245, 158, 11, 0.2))' 
              : 'rgba(255, 255, 255, 0.03)',
            border: idolState.pirState === 'MOTION_DETECTED' || idolState.pirState === 'ANNOUNCING'
              ? '1px solid rgba(234, 88, 12, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '6px' }}>SENSOR STATUS</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: idolState.pirState === 'IDLE' ? '#34d399' : '#fbbf24' }}>
              {idolState.pirState === 'IDLE' && '🟢 IDLE (Waiting for Motion)'}
              {idolState.pirState === 'MOTION_DETECTED' && '⚡ MOTION DETECTED! (Devotee Approaching)'}
              {idolState.pirState === 'ANNOUNCING' && '🔊 ANNOUNCING PANCHANGAM AUDIO'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#d1d5db', marginTop: '8px' }}>
              PIR Sensitivity: {idolState.pirSensitivity} • Cooldown: 10s
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#9ca3af' }}>
            <span>Last Motion Triggered:</span>
            <span style={{ fontWeight: 600, color: '#ffffff' }}>{idolState.lastTriggerTime}</span>
          </div>

          <button 
            className="btn-primary" 
            onClick={onTriggerMotion} 
            style={{ width: '100%', marginTop: '16px', justifyContent: 'center' }}
          >
            <Radio size={16} /> Simulate Human Approach
          </button>
        </div>

        {/* Today's Panchang Overview */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={20} color="#fbbf24" />
              Today's Panchangam ({currentCity.name})
            </h3>
            <button className="btn-secondary" onClick={() => onNavigateToTab('panchangam')} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              View Full
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Location:</span>
              <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.85rem' }}>{currentCity.name}, {currentCity.state}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Tithi:</span>
              <span style={{ fontWeight: 600, color: '#fbbf24', fontSize: '0.85rem' }}>{panchang.tithi}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Nakshatra:</span>
              <span style={{ fontWeight: 600, color: '#ffffff', fontSize: '0.85rem' }}>{panchang.nakshatra}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Rahu Kalam:</span>
              <span style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.85rem' }}>{panchang.rahuKalam}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)' }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Sunrise / Sunset:</span>
              <span style={{ fontWeight: 600, color: '#34d399', fontSize: '0.85rem' }}>{panchang.sunrise} / {panchang.sunset}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Hourly Analytics Bar Chart */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={20} color="#818cf8" />
          Hourly Devotee Approach Motion Activity
        </h3>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '140px', paddingTop: '20px' }}>
          {HOURLY_MOTION_DATA.map((item, idx) => {
            const maxVal = Math.max(...HOURLY_MOTION_DATA.map(d => d.count));
            const heightPct = (item.count / maxVal) * 100;
            return (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fbbf24' }}>{item.count}</div>
                <div style={{ 
                  width: '100%', 
                  maxWidth: '36px',
                  height: `${heightPct}%`, 
                  background: 'linear-gradient(180deg, #f59e0b, #ea580c)', 
                  borderRadius: '6px 6px 0 0',
                  boxShadow: '0 0 12px rgba(234, 88, 12, 0.3)'
                }} />
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{item.hour}</div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
