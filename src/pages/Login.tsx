import React, { useState } from 'react';
import api from '../services/api';

interface LoginProps {
  onLogin: (token: string, user: { id: string; name: string; role: string }) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!username || !password) { setError('Please enter username and password.'); return; }
    setLoading(true);
    try {
      const result = await api.login({ username, password });
      localStorage.setItem('auth_token', result.token);
      onLogin(result.token, result.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', background: 'var(--input-bg)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px 14px', color: 'var(--text-primary)',
    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <div style={{ width: 380, padding: 32, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 16 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 13,
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 14px',
            boxShadow: '0 6px 18px #ef444455',
          }}>🚨</div>
          <h1 style={{ margin: '0 0 4px', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>Kaa Rada Emergency Response</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>Dispatcher Login</p>
        </div>

        <div style={{ marginBottom: 14 }}>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
            placeholder="Username" style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Password" style={inputStyle}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && (
          <div style={{ background: '#ef444415', border: '1px solid #ef444433', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.82rem' }}>
            ⚠️ {error}
          </div>
        )}

        <button type="button" onClick={handleLogin} disabled={loading}
          style={{
            width: '100%', background: '#ef4444', color: '#fff', border: 'none',
            padding: '12px', borderRadius: 9, fontWeight: 700, fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px #ef444455',
          }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
         Kaa Rada Response System
        </p>
      </div>
    </div>
  );
};

export default Login;
