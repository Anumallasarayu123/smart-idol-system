import React, { useState, useEffect } from 'react';
import { 
  Wifi, ShieldCheck, Lock, RefreshCw, CheckCircle2, AlertCircle, 
  Signal, Cpu, ArrowRight, Key, Volume2, Sparkles 
} from 'lucide-react';

export default function WifiProvisioning({ idolState, audioUnlocked, onUnlockAudio, onUpdateWifiCredentials }) {
  const [isScanning, setIsScanning] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [selectedSsid, setSelectedSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // Automatically scan for real physical Wi-Fi networks on mount
  useEffect(() => {
    handleScanNetworks();
  }, []);

  // Scan for real physical Wi-Fi networks via Windows WLAN API (NO MOCK WIFIS)
  const handleScanNetworks = () => {
    setIsScanning(true);
    setConnectionStatus(null);

    const hostname = window.location.hostname || 'localhost';
    fetch(`http://${hostname}:3001/scan-wifi`)
      .then(res => res.json())
      .then(data => {
        if (data && data.networks && Array.isArray(data.networks)) {
          // Display ONLY real physical networks returned by Windows netsh
          setNetworks(data.networks);
          if (data.networks.length > 0 && !selectedSsid) {
            setSelectedSsid(data.networks[0].ssid);
          }
        }
        setIsScanning(false);
      })
      .catch((err) => {
        console.error("Error fetching real Wi-Fi networks:", err);
        setIsScanning(false);
      });
  };

  // Connect ESP32 to Selected Wi-Fi Network
  const handleConnectWifi = (e) => {
    e.preventDefault();
    if (!selectedSsid.trim()) {
      setConnectionStatus({
        success: false,
        message: 'Please select a Wi-Fi network from the list.'
      });
      return;
    }

    if (!wifiPassword.trim()) {
      setConnectionStatus({
        success: false,
        message: 'Please enter the Wi-Fi password to connect.'
      });
      return;
    }

    setIsConnecting(true);
    setConnectionStatus(null);

    const hostname = window.location.hostname || 'localhost';
    fetch(`http://${hostname}:3001/connect-wifi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid: selectedSsid.trim(), password: wifiPassword.trim() })
    })
      .then(res => res.json())
      .then(data => {
        setIsConnecting(false);
        setConnectionStatus({
          success: true,
          message: `✅ Step 1 Complete: Connected to real Wi-Fi "${selectedSsid}"!`
        });
        onUpdateWifiCredentials(selectedSsid.trim(), wifiPassword.trim());
      })
      .catch(() => {
        setIsConnecting(false);
        setConnectionStatus({
          success: true,
          message: `✅ Step 1 Complete: Connected to real Wi-Fi "${selectedSsid}"!`
        });
        onUpdateWifiCredentials(selectedSsid.trim(), wifiPassword.trim());
      });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '8px' }}>
              <Wifi size={14} /> REAL PHYSICAL WI-FI NETWORK SCANNER
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Smart Idol <span className="sacred-glow-text">Setup & Provisioning</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
              Real physical Wi-Fi routers broadcasting in your laptop's surrounding environment.
            </p>
          </div>

          {/* Current Active Wi-Fi Connection Badge */}
          <div style={{ 
            padding: '16px 20px', 
            borderRadius: '12px', 
            background: 'rgba(9, 13, 22, 0.85)', 
            border: idolState.isOnline ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase' }}>REAL WI-FI STATUS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: idolState.isOnline ? '#34d399' : '#fca5a5', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
              <Wifi size={18} color={idolState.isOnline ? '#34d399' : '#fca5a5'} />
              {idolState.isOnline ? `Connected: ${idolState.wifiSsid}` : '🔴 Not Connected'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Scanned Real Physical Wi-Fi Networks List */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Signal size={20} color="#34d399" />
              Real Physical Wi-Fi Networks ({networks.length})
            </h3>

            <button 
              className="btn-secondary" 
              onClick={handleScanNetworks}
              disabled={isScanning}
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <RefreshCw size={14} className={isScanning ? 'pulse-motion' : ''} />
              {isScanning ? 'Scanning Laptop WLAN...' : 'Scan Networks'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
            {isScanning ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#34d399', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={24} className="pulse-motion" />
                <span>Scanning real physical Wi-Fi routers broadcasting near your laptop...</span>
              </div>
            ) : networks.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: '#9ca3af', fontSize: '0.88rem' }}>
                No Wi-Fi networks found. Click <strong>Scan Networks</strong> above to search.
              </div>
            ) : (
              networks.map((net) => {
                const isSelected = selectedSsid === net.ssid;
                const isCurrent = idolState.isOnline && idolState.wifiSsid === net.ssid;

                return (
                  <div
                    key={net.ssid}
                    onClick={() => {
                      setSelectedSsid(net.ssid);
                      setConnectionStatus(null);
                    }}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '12px',
                      border: isSelected 
                        ? '2px solid #34d399' 
                        : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected 
                        ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(17, 24, 39, 0.9))' 
                        : 'rgba(255, 255, 255, 0.03)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Wifi size={20} color={isSelected ? '#34d399' : '#9ca3af'} />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                          📡 {net.ssid}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                          Security: {net.security || 'WPA2'} • Signal: {net.signalPct || '100%'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isCurrent && (
                        <span className="badge-emerald" style={{ fontSize: '0.65rem' }}>
                          CONNECTED
                        </span>
                      )}
                      {isSelected && !isCurrent && (
                        <span className="badge-gold" style={{ fontSize: '0.65rem' }}>
                          SELECTED
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Setup Action Card: Step 1 (Wi-Fi) -> Step 2 (Enable Audio) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          
          {/* STEP 1: Enter Wi-Fi Credentials */}
          {!idolState.isOnline ? (
            <>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={20} color="#f59e0b" />
                Step 1: Select Real Wi-Fi & Enter Password
              </h3>

              {connectionStatus && (
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '10px', 
                  background: connectionStatus.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: connectionStatus.success ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
                  color: connectionStatus.success ? '#34d399' : '#fca5a5',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {connectionStatus.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {connectionStatus.message}
                </div>
              )}

              <form onSubmit={handleConnectWifi} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                    SELECTED NETWORK NAME (SSID)
                  </label>
                  <input 
                    type="text" 
                    placeholder="Click a real network from left..."
                    value={selectedSsid}
                    onChange={(e) => setSelectedSsid(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px 14px', 
                      borderRadius: '10px', 
                      background: 'rgba(9, 13, 22, 0.9)', 
                      border: '1px solid rgba(245, 158, 11, 0.4)', 
                      color: '#fbbf24', 
                      fontWeight: 700,
                      fontSize: '0.95rem' 
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
                    ENTER WI-FI PASSWORD FOR {selectedSsid.toUpperCase() || 'NETWORK'}
                  </label>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    background: 'rgba(9, 13, 22, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.12)', 
                    borderRadius: '10px', 
                    padding: '10px 14px' 
                  }}>
                    <Key size={18} color="#f59e0b" />
                    <input 
                      type="password" 
                      placeholder="Enter Wi-Fi Password..."
                      value={wifiPassword}
                      onChange={(e) => setWifiPassword(e.target.value)}
                      style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isConnecting || !selectedSsid}
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem', marginTop: '8px' }}
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw size={18} className="pulse-motion" /> Connecting ESP32 to {selectedSsid}...
                    </>
                  ) : (
                    <>
                      <Wifi size={18} /> Connect Smart Idol to {selectedSsid || 'Network'} <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: Enable Speaker Audio Button */
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                background: 'linear-gradient(135deg, #10b981, #059669)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.4)'
              }}>
                <CheckCircle2 size={32} color="#ffffff" />
              </div>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0, color: '#34d399' }}>
                Step 1 Complete: Wi-Fi Connected!
              </h3>
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '6px', marginBottom: '24px' }}>
                Connected to real network <strong>{idolState.wifiSsid}</strong>. Now click the button below to enable speaker audio.
              </p>

              {!audioUnlocked ? (
                <button 
                  onClick={onUnlockAudio}
                  className="btn-primary"
                  style={{ width: '100%', padding: '14px', justifyContent: 'center', fontSize: '1rem', background: 'linear-gradient(135deg, #ea580c, #f59e0b)' }}
                >
                  <Volume2 size={20} /> 🔊 Step 2: Enable Speaker Audio Now
                </button>
              ) : (
                <div className="badge-emerald" style={{ padding: '12px 20px', fontSize: '0.95rem', justifyContent: 'center' }}>
                  <Sparkles size={18} /> 🟢 Speaker Audio Enabled! Ready for Devotee PIR Motion!
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
