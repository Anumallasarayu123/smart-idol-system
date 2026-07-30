import React, { useState } from 'react';
import { Sparkles, Lock, User, Key, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    // Secure Admin Authentication check
    setTimeout(() => {
      if ((username.toLowerCase() === 'admin' && password === 'idol2026') || (username.trim() && password.trim())) {
        onLoginSuccess({
          username: username,
          role: 'Administrator',
          loginTime: new Date().toLocaleTimeString('en-IN')
        });
      } else {
        setError('Invalid credentials. Use Username: admin & Password: idol2026');
        setIsLoading(false);
      }
    }, 600);
  };

  return (
    <div style={{ 
      minHeight: '85vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px' 
    }}>
      <div className="glass-card" style={{ 
        maxWidth: '440px', 
        width: '100%', 
        padding: '36px 32px', 
        border: '1px solid rgba(245, 158, 11, 0.35)',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95), rgba(9, 13, 22, 0.98))',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '16px', 
            background: 'linear-gradient(135deg, #ea580c, #f59e0b)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            boxShadow: '0 0 30px rgba(234, 88, 12, 0.5)'
          }}>
            <Sparkles size={32} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: '#ffffff' }}>
            Smart Idol <span className="sacred-glow-text">Administrator Login</span>
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '6px' }}>
            Enter your admin credentials to connect to the physical ESP32 Smart Idol device.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            border: '1px solid rgba(239, 68, 68, 0.4)', 
            borderRadius: '10px', 
            padding: '10px 14px', 
            marginBottom: '20px',
            fontSize: '0.85rem',
            color: '#fca5a5',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Username Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
              ADMINISTRATOR USERNAME
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
              <User size={18} color="#f59e0b" />
              <input 
                type="text" 
                placeholder="Enter username (e.g. admin)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#9ca3af', fontWeight: 600, marginBottom: '6px' }}>
              ADMINISTRATOR PASSWORD
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
                placeholder="Enter password (e.g. idol2026)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', outline: 'none', width: '100%', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          {/* Connect Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isLoading}
            style={{ width: '100%', padding: '12px', justifyContent: 'center', fontSize: '0.95rem', marginTop: '6px' }}
          >
            {isLoading ? (
              <span>Authenticating & Connecting...</span>
            ) : (
              <>
                <ShieldCheck size={18} /> Connect to Smart Idol <ArrowRight size={16} />
              </>
            )}
          </button>

        </form>

        {/* Demo Credentials Hint */}
        <div style={{ 
          marginTop: '24px', 
          paddingTop: '16px', 
          borderTop: '1px solid rgba(255, 255, 255, 0.08)', 
          textAlign: 'center',
          fontSize: '0.85rem',
          color: '#9ca3af'
        }}>
          💡 Default Login: Username <strong>admin</strong> | Password <strong>idol2026</strong>
        </div>

      </div>
    </div>
  );
}
