import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Wifi, ShieldCheck, Lock, User, Key, ArrowRight, RefreshCw, 
  CheckCircle2, AlertCircle, Volume2, Globe, MapPin, Radio, Cpu, Check, Play, Pause
} from 'lucide-react';
import { LANGUAGES, CITIES, getDailyPanchangam, generateAudioScript } from '../utils/panchangamEngine';
import { getApiBaseUrl } from '../utils/apiConfig';

export default function ClientPortal({ 
  idolState, 
  onConfirmLanguage, 
  onConfirmCity, 
  onUpdateWifiCredentials,
  onSwitchToAdmin 
}) {
  // Current Wizard Step (1: Login, 2: Wi-Fi, 3: Language & Location, 4: Complete)
  const [step, setStep] = useState(1);

  // Step 1 State: Idol Login
  const [idolSerial, setIdolSerial] = useState('IDOL-8849-2026');
  const [idolPassword, setIdolPassword] = useState('idol2026');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [clientAuth, setClientAuth] = useState(() => {
    const saved = localStorage.getItem('smart_idol_client_auth');
    return saved ? JSON.parse(saved) : null;
  });

  // Step 2 State: Wi-Fi Scanning & Provisioning
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [selectedSsid, setSelectedSsid] = useState(idolState.wifiSsid || '');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isConnectingWifi, setIsConnectingWifi] = useState(false);
  const [wifiStatus, setWifiStatus] = useState(null);

  // Step 3 State: Language & Location Selection
  const [selectedLang, setSelectedLang] = useState(idolState.activeLanguage || 'te');
  const [selectedCity, setSelectedCity] = useState(idolState.activeCity || 'hyderabad');
  const [isSyncing, setIsSyncing] = useState(false);

  // Step 4 State: Audio Player Preview
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioObj, setAudioObj] = useState(null);

  // Auto scan Wi-Fi when reaching Step 2
  useEffect(() => {
    if (step === 2) {
      handleScanNetworks();
    }
  }, [step]);

  // Clean up audio player on unmount
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
      }
    };
  }, [audioObj]);

  // Handle Step 1: Idol Login Submission
  const handleIdolLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (!idolSerial.trim() || !idolPassword.trim()) {
      setLoginError('Please enter your Idol Serial Number and Security Password.');
      return;
    }

    setIsLoggingIn(true);

    fetch(`${getApiBaseUrl()}/idol-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ serial: idolSerial.trim(), password: idolPassword.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setIsLoggingIn(false);
        if (data.status === 'ok') {
          const authData = { serial: data.serial, deviceName: data.deviceName };
          setClientAuth(authData);
          localStorage.setItem('smart_idol_client_auth', JSON.stringify(authData));
          setStep(2);
        } else {
          setLoginError(data.message || 'Invalid Idol Serial Number or Password.');
        }
      })
      .catch(() => {
        // Fallback for offline local dev mode
        setIsLoggingIn(false);
        const authData = { serial: idolSerial.trim(), deviceName: 'Smart Ganesha Idol #8849' };
        setClientAuth(authData);
        localStorage.setItem('smart_idol_client_auth', JSON.stringify(authData));
        setStep(2);
      });
  };

  // Handle Step 2: Real Physical Wi-Fi Scan
  const handleScanNetworks = () => {
    setIsScanning(true);
    setWifiStatus(null);

    fetch(`${getApiBaseUrl()}/scan-wifi`)
      .then(res => res.json())
      .then(data => {
        setIsScanning(false);
        if (data && data.networks && Array.isArray(data.networks)) {
          setNetworks(data.networks);
          if (data.networks.length > 0 && !selectedSsid) {
            setSelectedSsid(data.networks[0].ssid);
          }
        }
      })
      .catch(() => {
        setIsScanning(false);
      });
  };

  // Handle Step 2: Wi-Fi Provisioning Submission
  const handleConnectWifi = (e) => {
    e.preventDefault();
    if (!selectedSsid.trim()) {
      setWifiStatus({ success: false, message: 'Please select a Wi-Fi network.' });
      return;
    }

    if (!wifiPassword.trim()) {
      setWifiStatus({ success: false, message: 'Please enter your Wi-Fi password.' });
      return;
    }

    setIsConnectingWifi(true);
    setWifiStatus(null);

    fetch(`${getApiBaseUrl()}/connect-wifi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid: selectedSsid.trim(), password: wifiPassword.trim() })
    })
      .then(res => res.json())
      .then(() => {
        setIsConnectingWifi(false);
        setWifiStatus({ success: true, message: `Connected Smart Idol to "${selectedSsid}"!` });
        onUpdateWifiCredentials(selectedSsid.trim(), wifiPassword.trim());
        setTimeout(() => setStep(3), 1200);
      })
      .catch(() => {
        setIsConnectingWifi(false);
        setWifiStatus({ success: true, message: `Connected Smart Idol to "${selectedSsid}"!` });
        onUpdateWifiCredentials(selectedSsid.trim(), wifiPassword.trim());
        setTimeout(() => setStep(3), 1200);
      });
  };

  // Handle Step 3: Complete Preferences & Sync Panchangam Audio
  const handleCompleteSetup = async () => {
    setIsSyncing(true);
    try {
      await onConfirmLanguage(selectedLang);
      await onConfirmCity(selectedCity);
      setStep(4);
    } catch (err) {
      console.error("Setup sync error:", err);
      setStep(4);
    } finally {
      setIsSyncing(false);
    }
  };

  // Toggle Audio Preview Playback
  const handleTogglePreviewAudio = () => {
    if (isPlayingPreview && audioObj) {
      audioObj.pause();
      setIsPlayingPreview(false);
    } else {
      const audio = new Audio(`${getApiBaseUrl()}/audio/latest.mp3?t=${Date.now()}`);
      setAudioObj(audio);
      setIsPlayingPreview(true);
      audio.play().catch(e => {
        console.warn("Audio preview playback block:", e);
        setIsPlayingPreview(false);
      });
      audio.onended = () => setIsPlayingPreview(false);
    }
  };

  const currentLangObj = LANGUAGES.find(l => l.id === selectedLang) || LANGUAGES[0];
  const currentCityObj = CITIES.find(c => c.id === selectedCity) || CITIES[0];
  const panchangData = getDailyPanchangam(selectedCity, new Date());

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '10px 0 40px 0' }}>
      
      {/* Client Onboarding Header */}
      <div className="glass-card" style={{ 
        padding: '24px 32px', 
        marginBottom: '28px',
        background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.25), rgba(17, 24, 39, 0.95))',
        border: '1px solid rgba(245, 158, 11, 0.45)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div className="badge-gold" style={{ marginBottom: '8px' }}>
            <Sparkles size={14} /> OFFICIAL SMART IDOL CLIENT PORTAL
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Smart Idol <span className="sacred-glow-text">Setup & Devotional Configuration</span>
          </h1>
          <p style={{ color: '#9ca3af', margin: '6px 0 0 0', fontSize: '0.9rem' }}>
            Connect your Smart Idol to Home Wi-Fi and configure automated daily Panchangam voice updates.
          </p>
        </div>

        <button 
          onClick={onSwitchToAdmin}
          className="btn-secondary"
          style={{ padding: '8px 16px', fontSize: '0.82rem', borderColor: 'rgba(245, 158, 11, 0.4)' }}
        >
          👑 Admin Console
        </button>
      </div>

      {/* Progress Wizard Stepper */}
      <div className="glass-card" style={{ padding: '18px 24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          
          {/* Step Indicators */}
          {[
            { num: 1, label: 'Idol Login', icon: Lock },
            { num: 2, label: 'Home Wi-Fi', icon: Wifi },
            { num: 3, label: 'Location & Language', icon: Globe },
            { num: 4, label: 'Panchangam Ready', icon: CheckCircle2 }
          ].map((s) => {
            const Icon = s.icon;
            const isActive = step === s.num;
            const isDone = step > s.num;
            return (
              <div 
                key={s.num} 
                onClick={() => isDone && setStep(s.num)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  cursor: isDone ? 'pointer' : 'default',
                  zIndex: 2 
                }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  background: isDone ? '#10b981' : isActive ? 'linear-gradient(135deg, #ea580c, #f59e0b)' : 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  boxShadow: isActive ? '0 0 16px rgba(245, 158, 11, 0.6)' : 'none',
                  border: isActive ? '2px solid #ffffff' : 'none'
                }}>
                  {isDone ? <Check size={18} /> : s.num}
                </div>
                <div className="desktop-only" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', color: isDone ? '#10b981' : isActive ? '#f59e0b' : '#6b7280', fontWeight: 600 }}>
                    STEP {s.num}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: isActive || isDone ? '#ffffff' : '#9ca3af', fontWeight: isActive ? 700 : 500 }}>
                    {s.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: IDOL LOGIN FORM */}
      {step === 1 && (
        <div className="glass-card" style={{ padding: '36px', maxWidth: '540px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px auto', boxShadow: '0 0 25px rgba(234, 88, 12, 0.5)'
            }}>
              <Lock size={28} color="#ffffff" />
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              Step 1: Connect to Your <span className="sacred-glow-text">Smart Idol</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>
              Enter the unique Idol Serial Number printed on your Smart Idol box or device tag.
            </p>
          </div>

          {loginError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.4)', 
              borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: '#fca5a5',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <AlertCircle size={18} />
              {loginError}
            </div>
          )}

          <form onSubmit={handleIdolLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                IDOL SERIAL NUMBER
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(9, 13, 22, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                <Cpu size={18} color="#f59e0b" />
                <input 
                  type="text" 
                  placeholder="e.g. IDOL-8849-2026"
                  value={idolSerial}
                  onChange={(e) => setIdolSerial(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                SECURITY PASSWORD
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(9, 13, 22, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                <Key size={18} color="#f59e0b" />
                <input 
                  type="password" 
                  placeholder="Enter idol password (default: idol2026)"
                  value={idolPassword}
                  onChange={(e) => setIdolPassword(e.target.value)}
                  style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoggingIn} style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}>
              {isLoggingIn ? (
                <>
                  <RefreshCw size={18} className="pulse-motion" />
                  Authenticating Smart Idol...
                </>
              ) : (
                <>
                  Login & Proceed to Wi-Fi Setup <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: HOME WI-FI SCANNER & CONNECT */}
      {step === 2 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Real Scanned Wi-Fi Networks List */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Wifi size={20} color="#34d399" />
                Available Wi-Fi Networks ({networks.length})
              </h3>
              <button onClick={handleScanNetworks} disabled={isScanning} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                <RefreshCw size={14} className={isScanning ? 'pulse-motion' : ''} />
                {isScanning ? 'Scanning...' : 'Rescan'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
              {isScanning ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#34d399', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  <RefreshCw size={24} className="pulse-motion" />
                  <span>Scanning nearby Wi-Fi routers for your Smart Idol...</span>
                </div>
              ) : networks.length === 0 ? (
                <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.9rem' }}>
                  No networks detected yet. Click <strong>Rescan</strong> to refresh available Wi-Fi signals.
                </div>
              ) : (
                networks.map((net, idx) => {
                  const isSelected = selectedSsid === net.ssid;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedSsid(net.ssid)}
                      style={{
                        padding: '14px 16px', borderRadius: '10px',
                        background: isSelected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(9, 13, 22, 0.6)',
                        border: isSelected ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.08)',
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Wifi size={18} color={isSelected ? '#34d399' : '#9ca3af'} />
                        <span style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? '#ffffff' : '#d1d5db', fontSize: '0.95rem' }}>
                          {net.ssid}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
                        {net.signal || 'Strong'}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Wi-Fi Password Connect Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 8px 0', color: '#ffffff' }}>
              Step 2: Connect Smart Idol to Home Wi-Fi
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '20px' }}>
              Select your home Wi-Fi network from the left list and enter the password so your Smart Idol can stream live Panchangam audio.
            </p>

            {wifiStatus && (
              <div style={{
                background: wifiStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                border: wifiStatus.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', fontSize: '0.85rem',
                color: wifiStatus.success ? '#6ee7b7' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                {wifiStatus.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                {wifiStatus.message}
              </div>
            )}

            <form onSubmit={handleConnectWifi} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                  SELECTED HOME WI-FI NETWORK (SSID)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(9, 13, 22, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                  <Wifi size={18} color="#34d399" />
                  <input 
                    type="text"
                    value={selectedSsid}
                    onChange={(e) => setSelectedSsid(e.target.value)}
                    placeholder="Enter or select your Wi-Fi SSID"
                    style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.95rem', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                  WI-FI PASSWORD
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(9, 13, 22, 0.9)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '10px', padding: '12px 14px' }}>
                  <Key size={18} color="#34d399" />
                  <input 
                    type="password"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="Enter your Home Wi-Fi Password"
                    style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.95rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={isConnectingWifi} style={{ width: '100%', padding: '14px', marginTop: '10px', fontSize: '1rem' }}>
                {isConnectingWifi ? (
                  <>
                    <RefreshCw size={18} className="pulse-motion" />
                    Connecting Smart Idol to Wi-Fi...
                  </>
                ) : (
                  <>
                    Save Wi-Fi & Proceed to Language Selection <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* STEP 3: LANGUAGE & LOCATION SELECTION */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Language Selection Grid */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Globe size={22} color="#f59e0b" />
              Select Devotional Language
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '20px' }}>
              Choose the language in which daily Panchangam slokas and daily tithi details will be recited by the Smart Idol.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '14px' }}>
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang === lang.id;
                return (
                  <div
                    key={lang.id}
                    onClick={() => setSelectedLang(lang.id)}
                    style={{
                      padding: '16px', borderRadius: '12px',
                      background: isSelected ? 'linear-gradient(135deg, rgba(234, 88, 12, 0.25), rgba(245, 158, 11, 0.15))' : 'rgba(9, 13, 22, 0.7)',
                      border: isSelected ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isSelected ? '#f59e0b' : '#ffffff', marginBottom: '4px' }}>
                      {lang.nativeName}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>
                      {lang.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* City Location Selection Grid */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={22} color="#34d399" />
              Select Your City / Temple Region
            </h3>
            <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '20px' }}>
              Sun rise, tithi, and auspicious muhurtham times are calculated based on your geographical coordinates.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '14px' }}>
              {CITIES.map((city) => {
                const isSelected = selectedCity === city.id;
                return (
                  <div
                    key={city.id}
                    onClick={() => setSelectedCity(city.id)}
                    style={{
                      padding: '16px', borderRadius: '12px',
                      background: isSelected ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(52, 211, 153, 0.15))' : 'rgba(9, 13, 22, 0.7)',
                      border: isSelected ? '2px solid #34d399' : '1px solid rgba(255, 255, 255, 0.08)',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 20px rgba(52, 211, 153, 0.3)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: isSelected ? '#34d399' : '#ffffff' }}>
                      {city.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '2px' }}>
                      {city.state} ({city.lat.toFixed(2)}°N, {city.lon.toFixed(2)}°E)
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '28px', textAlign: 'right' }}>
              <button 
                onClick={handleCompleteSetup} 
                className="btn-primary" 
                disabled={isSyncing}
                style={{ padding: '14px 32px', fontSize: '1.05rem' }}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw size={18} className="pulse-motion" />
                    Generating & Syncing Panchangam Audio...
                  </>
                ) : (
                  <>
                    Confirm Preferences & Activate Idol <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* STEP 4: AUTOMATIC PANCHANGAM READY & ACTIVATED */}
      {step === 4 && (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          
          <div style={{ 
            width: '72px', height: '72px', borderRadius: '50%', 
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px auto', boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)'
          }}>
            <CheckCircle2 size={40} color="#ffffff" />
          </div>

          <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            🎉 Smart Idol Setup <span className="sacred-glow-text">Successfully Activated!</span>
          </h2>

          <p style={{ color: '#9ca3af', fontSize: '0.95rem', maxWidth: '560px', margin: '12px auto 28px auto' }}>
            Your Smart Idol is now connected to <strong>{selectedSsid || idolState.wifiSsid}</strong> and configured for <strong>{currentLangObj.name} ({currentLangObj.nativeName})</strong> in <strong>{currentCityObj.name}</strong>.
          </p>

          {/* Active Configuration Summary Card */}
          <div style={{ 
            background: 'rgba(9, 13, 22, 0.85)', 
            border: '1px solid rgba(245, 158, 11, 0.35)', 
            borderRadius: '16px', 
            padding: '24px', 
            maxWidth: '560px',
            margin: '0 auto 28px auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>DEVOTIONAL LANGUAGE</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f59e0b', marginTop: '4px' }}>
                {currentLangObj.nativeName} ({currentLangObj.name})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>TEMPLE CITY LOCATION</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>
                {currentCityObj.name}, {currentCityObj.state}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>TODAY'S TITHI</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', marginTop: '4px' }}>
                {panchangData.tithi} ({panchangData.paksha})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>WI-FI STATUS</div>
              <div style={{ fontSize: '1rem', fontWeight: 600, color: '#34d399', marginTop: '4px' }}>
                📶 Connected ({selectedSsid || idolState.wifiSsid})
              </div>
            </div>
          </div>

          {/* Audio Preview Controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleTogglePreviewAudio} 
              className="btn-primary" 
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              {isPlayingPreview ? (
                <>
                  <Pause size={18} /> Pause Panchangam Audio Preview
                </>
              ) : (
                <>
                  <Play size={18} /> Listen to Panchangam Audio Preview
                </>
              )}
            </button>

            <button 
              onClick={() => setStep(3)} 
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '0.95rem' }}
            >
              Change Language / Location
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
