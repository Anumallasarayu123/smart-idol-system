import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/DashboardOverview';
import LanguageSelector from './components/LanguageSelector';
import PanchangamView from './components/PanchangamView';
import LogsViewer from './components/LogsViewer';
import WifiProvisioning from './components/WifiProvisioning';
import LoginPage from './components/LoginPage';
import { INITIAL_IDOL_STATE } from './mockData/idolState';
import { LANGUAGES, CITIES, generateAudioScript, getDailyPanchangam } from './utils/panchangamEngine';
import { ttsEngine } from './utils/ttsEngine';

export default function App() {
  // Authentication State
  const [authUser, setAuthUser] = useState(() => {
    return localStorage.getItem('smart_idol_admin') || null;
  });

  // Idol Hardware & Panchangam System State
  const [idolState, setIdolState] = useState(() => {
    const saved = localStorage.getItem('smart_idol_state');
    return saved ? JSON.parse(saved) : INITIAL_IDOL_STATE;
  });

  // Active UI Navigation Tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Real-time Motion Alert Banner State
  const [lastMotionBanner, setLastMotionBanner] = useState(null);
  const [isSyncingLanguage, setIsSyncingLanguage] = useState(false);

  // System Event Logs State
  const [logs, setLogs] = useState(() => {
    return [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: 'SYSTEM_BOOT',
        detail: 'Smart Idol System initialized. Motion sensors active on Port 3001.',
        source: 'ESP32 Firmware Core'
      }
    ];
  });

  // Current Date for Ephemeris Panchangam Calculations
  const [currentDate] = useState(new Date());

  // Save Idol State to LocalStorage on Change
  useEffect(() => {
    localStorage.setItem('smart_idol_state', JSON.stringify(idolState));
  }, [idolState]);

  // Poll Express Server for Real ESP32 Hardware Motion Signals
  useEffect(() => {
    const hostname = window.location.hostname || 'localhost';
    const pollInterval = setInterval(() => {
      fetch(`http://${hostname}:3001/motion-status`)
        .then(res => res.json())
        .then(data => {
          if (data.motion) {
            console.log("⚡ REAL ESP32 MOTION SIGNAL DETECTED VIA SERVER!");
            handleTriggerMotion();
          }
        })
        .catch(() => {});
    }, 400);

    return () => clearInterval(pollInterval);
  }, [idolState.activeLanguage, idolState.activeCity]);

  // Handle Login Action
  const handleLoginSuccess = (username) => {
    setAuthUser(username);
    localStorage.setItem('smart_idol_admin', username);
  };

  // Handle Logout Action
  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('smart_idol_admin');
  };

  // ⚡ STRICT SYNCHRONOUS ADMIN LANGUAGE CONFIRMATION (Updates Server Audio & State)
  const handleConfirmLanguage = async (newLangId) => {
    const langObj = LANGUAGES.find(l => l.id === newLangId) || LANGUAGES[0];
    setIsSyncingLanguage(true);

    // Stop any currently playing audio when switching language
    ttsEngine.stop();

    // 1. Update React Idol State
    setIdolState(prev => ({
      ...prev,
      activeLanguage: newLangId
    }));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'LANGUAGE_CONFIRMED',
      detail: `Admin switched & locked idol language to ${langObj.name} (${langObj.nativeName})`,
      source: 'React Admin Dashboard'
    };

    setLogs(prev => [newLog, ...prev]);

    // 2. AWAIT SERVER AUDIO GENERATION (MP3 & WAV) FOR WEBPAGE AND ESP32 SPEAKER
    const panchang = getDailyPanchangam(idolState.activeCity, currentDate);
    const audioScriptText = generateAudioScript(langObj.id, panchang);
    const hostname = window.location.hostname || 'localhost';

    try {
      const response = await fetch(`http://${hostname}:3001/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: audioScriptText, 
          lang: langObj.code.split('-')[0], 
          city: idolState.activeCity 
        })
      });
      const data = await response.json();
      if (data.status === 'ok') {
        console.log(`✅ [RESPECTIVE LANGUAGE & LOCATION AUDIO SYNC] Server updated audio for ${langObj.name} in ${idolState.activeCity}: storage/latest.mp3 (${data.sizeBytes} bytes)`);
      }
    } catch (err) {
      console.error("Language sync error:", err);
    } finally {
      setIsSyncingLanguage(false);
    }
  };

  // Handle Admin City Location Confirmation (Updates Server Audio & Location Panchangam)
  const handleConfirmCity = async (newCityId) => {
    const cityObj = CITIES.find(c => c.id === newCityId) || CITIES[0];
    const currentLangObj = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
    setIsSyncingLanguage(true);

    ttsEngine.stop();

    setIdolState(prev => ({
      ...prev,
      activeCity: newCityId
    }));

    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'CITY_UPDATED',
      detail: `Admin updated idol location to ${cityObj.name}, ${cityObj.state}`,
      source: 'React Admin Dashboard'
    };
    setLogs(prev => [newLog, ...prev]);

    const panchang = getDailyPanchangam(newCityId, currentDate);
    const audioScriptText = generateAudioScript(currentLangObj.id, panchang);
    const hostname = window.location.hostname || 'localhost';

    try {
      const response = await fetch(`http://${hostname}:3001/generate-audio`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: audioScriptText, 
          lang: currentLangObj.code.split('-')[0], 
          city: newCityId 
        })
      });
      const data = await response.json();
      if (data.status === 'ok') {
        console.log(`✅ [LOCATION AUDIO SYNC] Server updated Panchangam audio for location ${cityObj.name} in ${currentLangObj.name}`);
      }
    } catch (err) {
      console.error("City sync error:", err);
    } finally {
      setIsSyncingLanguage(false);
    }
  };

  // Handle PIR Motion Sensor Trigger (Hardware / Web Button Signal)
  const handleTriggerMotion = () => {
    const currentTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const currentLangObj = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
    const currentCityObj = CITIES.find(c => c.id === idolState.activeCity) || CITIES[0];

    // 1. Set Motion Active in System State
    setIdolState(prev => ({
      ...prev,
      pirState: 'MOTION DETECTED',
      lastMotionTime: currentTime,
      motionCount: prev.motionCount + 1
    }));

    // Show Visual Alert Banner
    setLastMotionBanner({
      time: currentTime,
      city: currentCityObj.name,
      lang: currentLangObj.name
    });

    // 2. Add Motion Event Log
    const newLog = {
      id: Date.now(),
      timestamp: currentTime,
      type: 'MOTION_TRIGGER',
      detail: `ESP32 PIR sensor detected devotee. Announcing ${currentCityObj.name} Panchangam in ${currentLangObj.name}.`,
      source: 'ESP32 Motion Hardware'
    };
    setLogs(prev => [newLog, ...prev]);

    // 3. Play Audio Speech via Server MP3 Audio Player in UPDATED ACTIVE LANGUAGE & LOCATION
    const panchang = getDailyPanchangam(idolState.activeCity, currentDate);
    const audioScriptText = generateAudioScript(currentLangObj.id, panchang);

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

  // If Administrator is not logged in, render LoginPage
  if (!authUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0d14' }}>
      {/* Top Bar Navigation */}
      <Navbar 
        idolState={idolState} 
        activeTab={activeTab} 
        onSelectTab={setActiveTab} 
        onLogout={handleLogout}
        username={authUser}
      />

      {/* Global Real-Time Motion Notification Banner */}
      {lastMotionBanner && (
        <div style={{
          background: 'linear-gradient(90deg, #f59e0b, #d97706)',
          color: '#000000',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
          animation: 'pulse 1.5s infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚡</span>
            <span>HUMAN MOTION DETECTED BY ESP32 PIR SENSOR at {lastMotionBanner.time}! Playing {lastMotionBanner.city} Panchangam in {lastMotionBanner.lang} Voice Speaker Audio...</span>
          </div>
          <span style={{ fontSize: '0.85rem', background: '#000', color: '#fff', padding: '4px 10px', borderRadius: '12px' }}>LIVE SENSOR</span>
        </div>
      )}

      {/* Main Admin Workspace Area */}
      <main style={{ flex: 1, padding: '24px', maxWidth: '1400px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        {activeTab === 'dashboard' && (
          <DashboardOverview 
            idolState={idolState} 
            onNavigateToTab={setActiveTab} 
            onTriggerMotion={handleTriggerMotion}
          />
        )}

        {activeTab === 'language' && (
          <LanguageSelector 
            idolState={idolState} 
            onConfirmLanguage={handleConfirmLanguage}
            onConfirmCity={handleConfirmCity}
            isSyncing={isSyncingLanguage}
          />
        )}

        {activeTab === 'panchangam' && (
          <PanchangamView 
            idolState={idolState} 
            currentDate={currentDate}
          />
        )}

        {activeTab === 'wifi' && (
          <WifiProvisioning 
            idolState={idolState}
            onUpdateWifi={(ssid) => setIdolState(prev => ({ ...prev, wifiSsid: ssid, wifiStatus: 'CONNECTED' }))}
          />
        )}

        {activeTab === 'logs' && (
          <LogsViewer 
            logs={logs} 
            onClearLogs={() => setLogs([])}
          />
        )}
      </main>

      {/* Footer System Diagnostics Bar */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '12px 24px',
        fontSize: '0.8rem',
        color: '#6b7280',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#070a0f'
      }}>
        <div>Smart Idol Hardware Controller v2.5 | Multi-Language Ephemeris Engine</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span>API: Port 3001 (Active)</span>
          <span>Wi-Fi: {idolState.wifiSsid}</span>
          <span>Active Location: {idolState.activeCity.toUpperCase()}</span>
          <span>Active Lang: {idolState.activeLanguage.toUpperCase()}</span>
        </div>
      </footer>
    </div>
  );
}
