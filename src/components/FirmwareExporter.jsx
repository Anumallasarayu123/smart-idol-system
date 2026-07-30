import React, { useState } from 'react';
import { 
  Cpu, Copy, Download, Check, Settings, Code, Terminal, Layers 
} from 'lucide-react';
import { generateESP32Firmware } from '../utils/esp32CodeGenerator';

export default function FirmwareExporter({ idolState }) {
  const [ssid, setSsid] = useState('Temple_Mandir_WiFi');
  const [password, setPassword] = useState('SacredIdol@2026');
  const [serverUrl, setServerUrl] = useState('https://smart-idol.local/api');
  const [pirPin, setPirPin] = useState(13);
  const [speakerType, setSpeakerType] = useState('DFPlayer');
  const [copied, setCopied] = useState(false);

  const codeText = generateESP32Firmware({
    ssid,
    password,
    serverUrl,
    pirPin,
    speakerType,
    selectedLanguage: idolState.activeLanguage
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'smart_idol_esp32.ino';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(234, 88, 12, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-gold" style={{ marginBottom: '8px' }}>
              <Cpu size={14} /> ESP32 C++ ARDUINO CODE GENERATOR
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Physical Hardware <span className="sacred-glow-text">Firmware Exporter</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
              Download or copy ready-to-flash C++ Arduino code (`.ino`) for your physical ESP32 hardware, PIR sensor, and audio module.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-secondary" onClick={handleCopyCode}>
              {copied ? <Check size={16} color="#34d399" /> : <Copy size={16} />}
              {copied ? 'Copied Code!' : 'Copy Code'}
            </button>
            <button className="btn-primary" onClick={handleDownloadCode}>
              <Download size={16} /> Download .ino File
            </button>
          </div>
        </div>
      </div>

      {/* Firmware Configuration Options */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={20} color="#f59e0b" />
          Hardware & Wi-Fi Settings Configurator
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Wi-Fi SSID</label>
            <input 
              type="text" 
              value={ssid} 
              onChange={(e) => setSsid(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Wi-Fi Password</label>
            <input 
              type="text" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>Audio Hardware Module</label>
            <select 
              value={speakerType}
              onChange={(e) => setSpeakerType(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}
            >
              <option value="DFPlayer">DFPlayer Mini (UART Serial)</option>
              <option value="I2S_DAC">MAX98357A (I2S Digital DAC)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', marginBottom: '6px' }}>PIR Sensor GPIO Pin</label>
            <input 
              type="number" 
              value={pirPin} 
              onChange={(e) => setPirPin(parseInt(e.target.value))}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'rgba(9, 13, 22, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      {/* Arduino Code Viewer */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="#34d399" /> Generated Arduino C++ Sketch (`smart_idol_esp32.ino`)
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>
            Active Language: <strong>{idolState.activeLanguage.toUpperCase()}</strong>
          </span>
        </div>

        <pre style={{ 
          background: '#070a10', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#34d399',
          fontFamily: 'monospace',
          fontSize: '0.82rem',
          maxHeight: '480px',
          overflowY: 'auto',
          lineHeight: '1.5'
        }}>
          {codeText}
        </pre>
      </div>

    </div>
  );
}
