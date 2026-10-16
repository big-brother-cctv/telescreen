import React, { useState } from 'react';
import { Lock, User as UserIcon, ShieldAlert, ArrowRight } from 'lucide-react';
import { api, authStorage } from '../services/api';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';

interface LoginViewProps {
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError(t.login.validationError);
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
        setError(t.login.invalidResponse);
      }
    } catch (err: any) {
      setError(err.message || t.login.defaultError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(16px + env(safe-area-inset-top, 0px)) 16px calc(16px + env(safe-area-inset-bottom, 0px))',
      background: 'radial-gradient(ellipse at 50% 15%, rgba(225, 29, 72, 0.12) 0%, #07080b 70%)',
      position: 'relative'
    }}>
      {/* Selector de idioma flotante en login */}
      <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
        <LanguageSelector />
      </div>

      <div className="glass-panel brutalist-border" style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(12, 14, 20, 0.94)',
        padding: '30px 22px',
        borderRadius: '12px',
        boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 30px rgba(225, 29, 72, 0.2)',
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(159, 18, 57, 0.3), rgba(225, 29, 72, 0.2))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 28px rgba(225, 29, 72, 0.4)',
            border: '2px solid rgba(225, 29, 72, 0.5)',
            marginBottom: '16px',
            padding: '8px'
          }}>
            <img src="/favicon.svg" alt="Big Brother CCTV Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <h1 style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            BIG BROTHER <span style={{ color: 'var(--accent-red)' }}>CCTV</span>
          </h1>

          <div style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            marginTop: '6px',
            letterSpacing: '0.05em'
          }}>
            {t.login.subtitle}
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
              {t.login.usernameLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.login.usernamePlaceholder}
                autoComplete="username"
                style={{ width: '100%', paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t.login.passwordLabel}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.login.passwordPlaceholder}
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
            <span>{loading ? t.login.submitting : t.login.submit}</span>
            <ArrowRight size={16} />
          </button>
        </form>
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
        {t.login.footerNote}
      </div>
    </div>
  );
};
