import React, { useState } from 'react';
import { Eye, Lock, User as UserIcon, ShieldAlert, ArrowRight, KeyRound } from 'lucide-react';
import { api, authStorage } from '../services/api';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Credenciales incompletas: la falta de identificación constituye deslealtad');
      return;
    }
    try {
      setLoading(true);
      setError('');
      const res = await api.login(username.trim(), password);
      if (res.token) {
        authStorage.setToken(res.token);
        onSuccess();
      } else {
        setError('El Ministerio de la Verdad denegó la transmisión');
      }
    } catch (err: any) {
      setError(err.message || 'Credenciales inválidas. Este incidente ha sido registrado por la Policía del Pensamiento.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDevCredentials = () => {
    setUsername('admin');
    setPassword('admin');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(225, 29, 72, 0.12) 0%, #07080b 70%)',
    }}>
      {/* 1984 Top Slogan */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        color: '#fda4af',
        fontFamily: 'var(--font-display)',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
      }}>
        WAR IS PEACE • FREEDOM IS SLAVERY • IGNORANCE IS STRENGTH
      </div>

      <div className="glass-panel brutalist-border" style={{
        width: '100%',
        maxWidth: '440px',
        background: 'rgba(12, 14, 20, 0.94)',
        padding: '40px 32px',
        borderRadius: '12px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(225, 29, 72, 0.2)',
      }}>
        {/* Orwell Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #9f1239, #e11d48)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 28px rgba(225, 29, 72, 0.6)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            marginBottom: '16px'
          }}>
            <Eye size={36} color="#fff" />
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            BIG BROTHER <span style={{ color: 'var(--accent-red)' }}>IS WATCHING YOU</span>
          </h1>

          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginTop: '6px',
            letterSpacing: '0.05em'
          }}>
            OCEANIA // TELESCREEN SURVEILLANCE TERMINAL
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            background: 'rgba(225, 29, 72, 0.15)',
            border: '1px solid rgba(225, 29, 72, 0.4)',
            borderRadius: '6px',
            color: 'var(--text-party)',
            fontSize: '0.78rem',
            fontFamily: 'var(--font-mono)',
            marginBottom: '20px',
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Identificador de Camarada
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nombre de usuario"
                autoComplete="username"
                style={{ width: '100%', paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Clave de Acceso
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ width: '100%', paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '6px', fontSize: '0.85rem' }}
          >
            <span>{loading ? 'AUTENTICANDO CON MINITRUE...' : 'TRANSMITIR ACCESO A TELEPANTALLA'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Dev Autofill Button */}
        <div style={{
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid var(--border-subtle)',
          textAlign: 'center',
        }}>
          <button
            type="button"
            onClick={autofillDevCredentials}
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '6px 12px', width: '100%', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}
          >
            <KeyRound size={13} color="var(--accent-amber)" />
            AUTORIZACIÓN PARTIDO INTERIOR: (admin / admin)
          </button>
        </div>
      </div>

      {/* Quote footer */}
      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.7rem',
        fontFamily: 'var(--font-mono)',
        maxWidth: '440px',
      }}>
        "El Gran Hermano te vigila. La telepantalla recibía y transmitía simultáneamente." — George Orwell, 1984
      </div>
    </div>
  );
};
