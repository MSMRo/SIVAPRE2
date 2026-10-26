import React, { useState } from 'react';

interface Props { onLogin: (u: string, p: string) => Promise<void>; }

export default function LoginPanel({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-grid"></div>
      </div>
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-s-big">S</span>
        </div>
        <h1 className="login-title">SIVAPRE</h1>
        <p className="login-subtitle">Panel de Autoridades Sanitarias</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Usuario</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ingresa tu usuario"
              required
            />
          </div>
          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar al Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}