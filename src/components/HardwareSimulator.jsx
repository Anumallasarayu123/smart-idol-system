import React, { useState } from 'react';
import { 
  Radio, Volume2, Cpu, Zap, Activity, CheckCircle2, UserCheck, 
  Sparkles, RefreshCw, Layers, ShieldCheck 
} from 'lucide-react';
import { LANGUAGES, generateAudioScript, getDailyPanchangam } from '../utils/panchangamEngine';
import { ttsEngine } from '../utils/ttsEngine';

export default function HardwareSimulator({ idolState, onTriggerMotion }) {
  const [distance, setDistance] = useState(5); // Meters
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLog, setSimLog] = useState([]);

  const currentLang = LANGUAGES.find(l => l.id === idolState.activeLanguage) || LANGUAGES[0];
  const panchang = getDailyPanchangam();
  const scriptText = generateAudioScript(currentLang.id, panchang);

  const handleSimulateApproach = () => {
    setIsSimulating(true);
    const newLog = [
      `[00:00] Devotee approached within ${distance} meters. PIR pin GPIO 13 went HIGH.`,
      `[00:01] ESP32 received interrupt signal. Checked admin language lock: "${currentLang.name}".`,
      `[00:02] Triggering DFPlayer Mini / Audio module playback...`,
      `[00:03] Playing Panchangam announcement audio in ${currentLang.name}!`
    ];
    setSimLog(newLog);

    // Call parent handler to update trigger count
    onTriggerMotion();

    // Speak audio in browser
    ttsEngine.speak(scriptText, currentLang.code, {
      onEnd: () => setIsSimulating(false),
      onError: () => setIsSimulating(false)
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div>
          <div className="badge-indigo" style={{ marginBottom: '8px' }}>
            <Radio size={14} /> VIRTUAL HARDWARE INTERACTIVE BENCH
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
            ESP32 & PIR Motion Sensor <span className="sacred-glow-text">Idol Simulator</span>
          </h2>
          <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
            Test the complete hardware interaction loop: Devotee approach ➔ PIR Motion Detection ➔ ESP32 Interrupt ➔ Audio Announcement in Confirmed Language.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* Interactive Simulation Bench */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserCheck size={20} color="#fbbf24" /> Devotee Distance & Approach Control
          </h3>

          {/* Distance Slider */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: '#9ca3af' }}>Distance from Smart Idol:</span>
              <span style={{ fontWeight: 700, color: distance <= 3 ? '#ea580c' : '#fbbf24' }}>
                {distance} Meters {distance <= 3 ? '(In PIR Motion Sensing Zone)' : '(Far Range)'}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="10" 
              value={distance}
              onChange={(e) => setDistance(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
            />
          </div>

          {/* Simulated Idol Status Visual Box */}
          <div style={{ 
            padding: '24px', 
            borderRadius: '16px', 
            background: isSimulating ? 'rgba(234, 88, 12, 0.2)' : 'rgba(9, 13, 22, 0.8)',
            border: isSimulating ? '2px solid #ea580c' : '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            boxShadow: isSimulating ? '0 0 30px rgba(234, 88, 12, 0.4)' : 'none',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px auto',
              background: isSimulating ? 'linear-gradient(135deg, #ea580c, #f59e0b)' : 'rgba(255, 255, 255, 0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isSimulating ? '0 0 25px #ea580c' : 'none'
            }} className={isSimulating ? 'pulse-motion' : ''}>
              <Sparkles size={40} color={isSimulating ? '#ffffff' : '#6b7280'} />
            </div>

            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
              {isSimulating ? '🛕 IDOL ANNOUNCING PANCHANGAM' : '🛕 SACRED IDOL STANDBY'}
            </h4>
            
            <p style={{ fontSize: '0.85rem', color: isSimulating ? '#fbbf24' : '#9ca3af', marginTop: '6px' }}>
              Confirmed Audio Language: <strong>{currentLang.flag} {currentLang.name} ({currentLang.script})</strong>
            </p>
          </div>

          {/* Action Trigger Button */}
          <button 
            className="btn-primary"
            onClick={handleSimulateApproach}
            disabled={isSimulating}
            style={{ width: '100%', marginTop: '20px', justifyContent: 'center', padding: '14px', fontSize: '1rem' }}
          >
            {isSimulating ? (
              <>
                <RefreshCw size={18} className="pulse-motion" /> Speaking Panchangam Audio...
              </>
            ) : (
              <>
                <Zap size={18} /> Walk Near Idol (Trigger Motion)
              </>
            )}
          </button>
        </div>

        {/* Live Simulation Real-time Serial Logs */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#34d399" />
            ESP32 Motion Circuit Signal Log
          </h3>

          <div style={{ 
            background: '#090d16', 
            borderRadius: '12px', 
            padding: '16px', 
            border: '1px solid rgba(255, 255, 255, 0.1)',
            minHeight: '220px',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            color: '#34d399',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ color: '#6b7280', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '6px' }}>
              --- ESP32 UART LOG OUTPUT (115200 BAUD) ---
            </div>
            {simLog.length === 0 ? (
              <div style={{ color: '#6b7280', fontStyle: 'italic', paddingTop: '40px', textAlign: 'center' }}>
                Click "Walk Near Idol" button to simulate PIR sensor motion trigger.
              </div>
            ) : (
              simLog.map((log, i) => (
                <div key={i} style={{ lineHeight: '1.4' }}>{log}</div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Wiring & Circuit Schematic Summary */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Cpu size={20} color="#f59e0b" />
          Hardware Pinout Diagram & Connections
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontWeight: 700, color: '#ea580c', fontSize: '0.9rem' }}>PIR Motion Sensor (HC-SR501)</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
              • VCC ➔ 5V<br />
              • GND ➔ GND<br />
              • OUT ➔ GPIO 13 (ESP32)
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.9rem' }}>DFPlayer Mini Audio Module</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
              • VCC ➔ 5V<br />
              • TX ➔ GPIO 16 (ESP32 RX2)<br />
              • RX ➔ GPIO 17 (ESP32 TX2 with 1k resistor)
            </div>
          </div>

          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.9rem' }}>Speaker Output</div>
            <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '6px' }}>
              • SPK_1 ➔ Speaker (+) 8 Ohm 3W<br />
              • SPK_2 ➔ Speaker (-)
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
