import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import LanguageSelector from './components/LanguageSelector';
import PanchangamView from './components/PanchangamView';
import HardwareSimulator from './components/HardwareSimulator';
import FirmwareExporter from './components/FirmwareExporter';
import LogsViewer from './components/LogsViewer';
import LoginPage from './components/LoginPage';
import WifiProvisioning from './components/WifiProvisioning';
import { INITIAL_IDOL_STATE, INITIAL_LOGS } from './mockData/idolState';
import { LANGUAGES, CITIES, generateAudioScript, getDailyPanchangam } from './utils/panchangamEngine';
import { ttsEngine } from './utils/ttsEngine';
import { Volume2, VolumeX, AlertCircle, Wifi, Play, Sparkles, CheckCircle2, Zap } from 'lucide-react';

export default function App() {
  const [authUser, setAuthUser] = useState(() => {
    const saved = localStorage.getItem('smart_idol_admin_auth');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('wificonnect');
  const [idolState, setIdolState] = useState(INITIAL_IDOL_STATE);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [lastMotionBanner, setLastMotionBanner] = useState(null);
  const [discoveredEspIp, setDiscoveredEspIp] = useState('192.168.31.186');

  // Handle Login Success
  const handleLoginSuccess = (userData) => {
    setAuthUser(userData);
    localStorage.setItem('smart_idol_admin_auth', JSON.stringify(userData));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN'),
      type: 'ADMIN_LOGIN',
      detail: `Administrator ${userData.username} logged in successfully`,
      source: 'Admin Portal'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Handle Logout
  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('smart_idol_admin_auth');
  };

  // Wi-Fi Provisioning
  const handleUpdateWifiCredentials = (ssid, password) => {
    setIdolState(prev => ({
      ...prev,
      isOnline: true,
      wifiSsid: ssid,
      ipAddress: discoveredEspIp || 'smart-idol.local'
    }));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN'),
      type: 'WIFI_PROVISIONED',
      detail: `Smart Idol connected dynamically to network "${ssid}"`,
      source: 'Dynamic Wi-Fi Manager'
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Enable Speaker Audio Engine on user click & IMMEDIATELY PLAY PANCHANGAM ANNOUNCEMENT
  const handleUnlockAudio = () => {
    setAudioUnlocked(true);

    const currentLangObj = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
    const currentCityObj = CITIES.find(c => c.id === idolState.activeCity) || CITIES[0];
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setLastMotionBanner(`⚡ SPEAKER AUDIO ENABLED! Playing ${currentCityObj.name} Panchangam in ${currentLangObj.name}...`);

    // Lock state to ANNOUNCING
    setIdolState(prev => ({
      ...prev,
      pirState: 'ANNOUNCING',
      totalTriggersToday: prev.totalTriggersToday + 1,
      lastTriggerTime: currentTime
    }));

    const newLog = {
      id: Date.now(),
      timestamp: currentTime,
      type: 'AUDIO_UNLOCKED',
      detail: `Speaker Audio Engine enabled by Administrator. Playing ${currentCityObj.name} Panchangam in ${currentLangObj.name}.`,
      source: 'Speaker Manager'
    };
    setLogs(prev => [newLog, ...prev]);

    // Play Temple Chime + Full Spoken Panchangam Speech
    const panchang = getDailyPanchangam(idolState.activeCity, currentDate);
    const audioScriptText = generateAudioScript(currentLangObj.id, panchang);

    // Sync spoken Panchangam text string with Node.js bridge server
    fetch('http://localhost:3001/update-panchangam-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: audioScriptText, lang: currentLangObj.code })
    }).catch(() => {});

    ttsEngine.speak(audioScriptText, currentLangObj.code, {
      onEnd: () => {
        setTimeout(() => {
          setIdolState(prev => ({ ...prev, pirState: 'IDLE' }));
          setLastMotionBanner(null);
        }, 1000);
      },
      onError: () => {
        setTimeout(() => {
          setIdolState(prev => ({ ...prev, pirState: 'IDLE' }));
          setLastMotionBanner(null);
        }, 1000);
      }
    });
  };

  // AUTOMATIC NETWORK DISCOVERY & MOTION POLLING (WITH ZERO-QUEUEING DISCARD)
  useEffect(() => {
    if (!authUser || !audioUnlocked) return;

    const pollInterval = setInterval(() => {
      // RULE: IF AUDIO IS CURRENTLY PLAYING, DRAIN & DISCARD ALL INCOMING TRIGGERS IMMEDIATELY!
      if (idolState.pirState === 'ANNOUNCING' || ttsEngine.isSpeaking) {
        // Drain pending motion signals so they are NOT stored in queue!
        if (discoveredEspIp) {
          fetch(`http://${discoveredEspIp}/motion`).catch(() => {});
        }
        fetch('http://localhost:3001/motion-status').catch(() => {});
        return;
      }

      // ONLY PROCESS TRIGGERS WHEN IDOL IS IDLE AND NOT PLAYING AUDIO!
      if (discoveredEspIp) {
        fetch(`http://${discoveredEspIp}/motion`)
          .then(res => res.json())
          .then(data => {
            if (data && data.motion && idolState.pirState !== 'ANNOUNCING' && !ttsEngine.isSpeaking) {
              console.log(`⚡ Fresh ESP32 Motion Signal Received while Idle!`);
              handleTriggerMotion();
            }
          })
          .catch(() => {});
      }

      fetch('http://localhost:3001/motion-status')
        .then(res => res.json())
        .then(data => {
          if (data && data.motion && idolState.pirState !== 'ANNOUNCING' && !ttsEngine.isSpeaking) {
            console.log("⚡ Fresh Bridge Server Motion Signal Received while Idle!");
            handleTriggerMotion();
          }
        })
        .catch(() => {});

    }, 400);

    return () => clearInterval(pollInterval);
  }, [idolState, currentDate, authUser, audioUnlocked, discoveredEspIp]);

  // Automatic Midnight Rollover Listener & Daily Panchangam Refresh
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getDate() !== currentDate.getDate()) {
        setCurrentDate(now);

        const newLog = {
          id: Date.now(),
          timestamp: '12:00:00 AM (Midnight)',
          type: 'PANCHANAM_REFRESH',
          detail: `Midnight Rollover: Daily Panchangam automatically recalculated for ${now.toDateString()}`,
          source: 'Automatic Midnight Engine'
        };
        setLogs(prev => [newLog, ...prev]);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [currentDate]);

  // Handle Admin Language Confirmation
  const handleConfirmLanguage = (newLangId) => {
    const langObj = LANGUAGES.find(l => l.id === newLangId);

    setIdolState(prev => ({
      ...prev,
      activeLanguage: newLangId
    }));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'LANGUAGE_CONFIRMED',
      detail: `Admin confirmed & locked idol language to ${langObj.name} (${langObj.script})`,
      source: 'React Admin Dashboard'
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // Handle Admin City Location Confirmation
  const handleConfirmCity = (newCityId) => {
    const cityObj = CITIES.find(c => c.id === newCityId) || CITIES[0];

    setIdolState(prev => ({
      ...prev,
      activeCity: newCityId
    }));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'LOCATION_CONFIRMED',
      detail: `Admin calibrated Panchangam location to ${cityObj.name}, ${cityObj.state}`,
      source: 'React Admin Dashboard'
    };

    setLogs(prev => [newLog, ...prev]);
  };

  // Handle Devotee PIR Motion Sensor Trigger (Strict Single Execution)
  const handleTriggerMotion = () => {
    // DISCARD IMMEDIATELY IF AUDIO IS ALREADY PLAYING!
    if (idolState.pirState === 'ANNOUNCING' || ttsEngine.isSpeaking) {
      console.log("🚫 Motion trigger generated DURING audio playback — DISCARDED completely.");
      return;
    }

    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentLangObj = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
    const currentCityObj = CITIES.find(c => c.id === idolState.activeCity) || CITIES[0];

    setLastMotionBanner(`⚡ MOTION DETECTED AT ${currentTime}! Playing ${currentCityObj.name} Panchangam in ${currentLangObj.name}...`);

    // 1. Lock state to ANNOUNCING
    setIdolState(prev => ({
      ...prev,
      pirState: 'ANNOUNCING',
      totalTriggersToday: prev.totalTriggersToday + 1,
      lastTriggerTime: currentTime
    }));

    // 2. Add Motion Event Log
    const newLog = {
      id: Date.now(),
      timestamp: currentTime,
      type: 'MOTION_TRIGGER',
      detail: `ESP32 PIR sensor detected devotee. Announcing ${currentCityObj.name} Panchangam in ${currentLangObj.name}.`,
      source: 'ESP32 Motion Hardware'
    };
    setLogs(prev => [newLog, ...prev]);

    // 3. Play Audio Speech via Browser Speech Engine
    const panchang = getDailyPanchangam(idolState.activeCity, currentDate);
    const audioScriptText = generateAudioScript(currentLangObj.id, panchang);

    ttsEngine.speak(audioScriptText, currentLangObj.code, {
      onEnd: () => {
        // Clear audio state only after speech is 100% finished
        setTimeout(() => {
          setIdolState(prev => ({ ...prev, pirState: 'IDLE' }));
          setLastMotionBanner(null);
        }, 1000);
      },
      onError: () => {
        setTimeout(() => {
          setIdolState(prev => ({ ...prev, pirState: 'IDLE' }));
          setLastMotionBanner(null);
        }, 1000);
      }
    });
  };

  // If Administrator is not logged in, render LoginPage
  if (!authUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Banner: Enable Speaker Audio */}
      {!audioUnlocked ? (
        <div style={{ background: 'linear-gradient(90deg, #ea580c, #f59e0b)', color: '#ffffff', padding: '12px 20px', textAlign: 'center', fontWeight: 600, fontSize: '0.92rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', flexWrap: 'wrap', boxShadow: '0 4px 15px rgba(234, 88, 12, 0.4)' }}>
          <AlertCircle size={20} />
          <span>Click button to enable browser speaker audio for ESP32 motion triggers:</span>
          <button 
            onClick={handleUnlockAudio}
            style={{ background: '#ffffff', color: '#ea580c', border: 'none', padding: '8px 20px', borderRadius: '8px', fontWeight: 800, cursor: 'pointer', fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}
          >
            <Volume2 size={18} /> 🔊 Enable Speaker Audio Now
          </button>
        </div>
      ) : (
        <div style={{ background: idolState.pirState === 'ANNOUNCING' ? 'linear-gradient(90deg, #ea580c, #f59e0b)' : 'linear-gradient(90deg, rgba(16, 185, 129, 0.95), rgba(5, 150, 105, 0.95))', color: '#ffffff', padding: '10px 20px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', transition: 'all 0.3s ease' }}>
          {idolState.pirState === 'ANNOUNCING' ? <Zap size={18} color="#fff" /> : <CheckCircle2 size={18} />}
          <span>{lastMotionBanner || '🟢 Listening for ESP32 PIR Motion Sensor... (Triggers during speech discarded)'}</span>
          <button 
            onClick={handleTriggerMotion}
            disabled={idolState.pirState === 'ANNOUNCING'}
            style={{ background: idolState.pirState === 'ANNOUNCING' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '4px 12px', borderRadius: '6px', cursor: idolState.pirState === 'ANNOUNCING' ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
          >
            {idolState.pirState === 'ANNOUNCING' ? '🔊 Announcing Audio (Busy)...' : '⚡ Test Speech Now'}
          </button>
        </div>
      )}

      {/* Header Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        idolState={idolState}
        onTriggerMotion={handleTriggerMotion}
        authUser={authUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '24px 20px 60px 20px', flex: 1 }}>
        {activeTab === 'wificonnect' && (
          <WifiProvisioning 
            idolState={idolState} 
            audioUnlocked={audioUnlocked}
            onUnlockAudio={handleUnlockAudio}
            onUpdateWifiCredentials={handleUpdateWifiCredentials}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardOverview 
            idolState={idolState} 
            currentDate={currentDate}
            onNavigateToTab={setActiveTab} 
            onTriggerMotion={handleTriggerMotion} 
          />
        )}

        {activeTab === 'language' && (
          <LanguageSelector 
            idolState={idolState} 
            currentDate={currentDate}
            onConfirmLanguage={handleConfirmLanguage}
            onConfirmCity={handleConfirmCity}
          />
        )}

        {activeTab === 'panchangam' && (
          <PanchangamView 
            idolState={idolState} 
            currentDate={currentDate}
          />
        )}

        {activeTab === 'simulator' && (
          <HardwareSimulator 
            idolState={idolState} 
            currentDate={currentDate}
            onTriggerMotion={handleTriggerMotion} 
          />
        )}

        {activeTab === 'firmware' && (
          <FirmwareExporter 
            idolState={idolState} 
          />
        )}

        {activeTab === 'logs' && (
          <LogsViewer 
            logs={logs} 
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(245, 158, 11, 0.15)', background: 'rgba(9, 13, 22, 0.95)', padding: '20px', textAlign: 'center', fontSize: '0.85rem', color: '#6b7280' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            🛕 <strong>Smart Idol IoT System & Admin Dashboard</strong> • Zero-Queue Motion Discard Architecture
          </div>
          <div>
            Trigger Guard: <span style={{ color: '#34d399', fontWeight: 600 }}>Active (Discards triggers during speech)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
