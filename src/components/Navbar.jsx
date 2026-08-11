import React from 'react';
import { Sparkles, Volume2, ShieldCheck, Activity, Terminal, LogOut, UserCheck, Wifi } from 'lucide-react';
import { LANGUAGES } from '../utils/panchangamEngine';

export default function Navbar({ activeTab, onSelectTab, idolState, username, onLogout }) {
  const currentLang = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'wifi', label: 'Connect Wi-Fi to Idol', icon: Wifi, highlight: true },
    { id: 'language', label: 'Admin Language Setup', icon: ShieldCheck },
    { id: 'panchangam', label: 'Today\'s Panchangam', icon: Sparkles },
    { id: 'logs', label: 'System Logs', icon: Terminal },
  ];

  return (
    <header style={{ borderBottom: '1px solid rgba(245, 158, 11, 0.15)', background: 'rgba(9, 13, 22, 0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '42px', 
            height: '42px', 
            borderRadius: '12px', 
            background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="sacred-glow-text">SMART IDOL</span>
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Real Hardware Live
              </span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: 0 }}>ESP32 Panchangam Hardware Admin Portal</p>
          </div>
        </div>

        {/* Status Indicators & Admin Session */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Admin User Badge */}
          {username && (
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.15)', 
              border: '1px solid rgba(99, 102, 241, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#a5b4fc',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <UserCheck size={14} />
              <span>Admin: {username}</span>
            </div>
          )}

          {/* Active Language Badge */}
          <div style={{ 
            padding: '6px 14px', 
            borderRadius: '10px', 
            background: 'rgba(234, 88, 12, 0.15)', 
            border: '1px solid rgba(234, 88, 12, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Volume2 size={16} color="#fbbf24" />
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Language:</span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
              {currentLang.flag} {currentLang.name}
            </span>
          </div>

          {/* ESP32 Hardware Status */}
          <div className="badge-emerald">
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', display: 'inline-block', boxShadow: '0 0 8px #34d399' }} />
            ESP32 HARDWARE CONNECTED
          </div>

          {/* Logout Button */}
          {username && (
            <button 
              onClick={onLogout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              title="Logout Administrator Session"
            >
              <LogOut size={14} /> Logout
            </button>
          )}

        </div>

      </div>

      {/* Primary Tab Links */}
      <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 20px', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                border: 'none',
                borderBottom: isActive ? '3px solid #f59e0b' : '3px solid transparent',
                background: isActive ? 'rgba(245, 158, 11, 0.12)' : (tab.highlight ? 'rgba(52, 211, 153, 0.15)' : 'transparent'),
                color: isActive ? '#fbbf24' : (tab.highlight ? '#34d399' : '#9ca3af'),
                fontWeight: isActive || tab.highlight ? 700 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                borderRadius: '8px 8px 0 0',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
