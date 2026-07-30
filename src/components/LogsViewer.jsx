import React, { useState } from 'react';
import { Terminal, Filter, ShieldCheck, Activity, Cpu, Download } from 'lucide-react';

export default function LogsViewer({ logs }) {
  const [filterType, setFilterType] = useState('ALL');

  const filteredLogs = logs.filter(log => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const handleExportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `smart_idol_logs_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(17, 24, 39, 0.9))', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="badge-indigo" style={{ marginBottom: '8px' }}>
              <Terminal size={14} /> SYSTEM AUDIT LOGS
            </div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Activity & Motion <span className="sacred-glow-text">Audit History</span>
            </h2>
            <p style={{ color: '#9ca3af', marginTop: '6px', fontSize: '0.95rem' }}>
              Track administrator language locking events, PIR motion triggers, Panchangam audio plays, and ESP32 connectivity logs.
            </p>
          </div>

          <button className="btn-secondary" onClick={handleExportLogs}>
            <Download size={16} /> Export Logs (JSON)
          </button>
        </div>
      </div>

      {/* Log Filters */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={18} color="#f59e0b" />
        <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>FILTER LOGS BY TYPE:</span>
        
        {['ALL', 'LANGUAGE_CONFIRMED', 'MOTION_TRIGGER', 'SYSTEM_BOOT', 'PANCHANAM_REFRESH'].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: filterType === type ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
              background: filterType === type ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: filterType === type ? '#fbbf24' : '#9ca3af',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Logs Table / Timeline */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#9ca3af' }}>
              No logs matching the selected filter.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div 
                key={log.id} 
                style={{ 
                  padding: '14px 18px', 
                  borderRadius: '10px', 
                  background: 'rgba(255, 255, 255, 0.03)', 
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    padding: '8px', 
                    borderRadius: '8px', 
                    background: log.type === 'LANGUAGE_CONFIRMED' 
                      ? 'rgba(234, 88, 12, 0.2)' 
                      : log.type === 'MOTION_TRIGGER' 
                      ? 'rgba(16, 185, 129, 0.2)' 
                      : 'rgba(99, 102, 241, 0.2)',
                    color: log.type === 'LANGUAGE_CONFIRMED' ? '#fbbf24' : log.type === 'MOTION_TRIGGER' ? '#34d399' : '#818cf8'
                  }}>
                    {log.type === 'LANGUAGE_CONFIRMED' && <ShieldCheck size={18} />}
                    {log.type === 'MOTION_TRIGGER' && <Activity size={18} />}
                    {log.type !== 'LANGUAGE_CONFIRMED' && log.type !== 'MOTION_TRIGGER' && <Cpu size={18} />}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#ffffff' }}>{log.detail}</div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>Source: {log.source}</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>
                  {log.timestamp}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
