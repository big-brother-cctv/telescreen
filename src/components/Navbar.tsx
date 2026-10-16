import React, { useState, useEffect } from 'react';
import { Users, LogOut, Radio, Terminal } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';
import { useLanguage, LanguageSelector } from '../i18n/LanguageContext';

interface NavbarProps {
  currentView: 'grid' | 'admin' | 'users';
  onNavigate: (view: 'grid' | 'admin' | 'users') => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const { t, language } = useLanguage();
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString(language === 'es' ? 'es-ES' : 'en-US', { hour12: false }));
    };
    updateClock();
    const clockInterval = setInterval(updateClock, 1000);

    const checkApi = async () => {
      const isUp = await api.checkHealth();
      setApiOnline(isUp);
    };
    checkApi();
    const healthInterval = setInterval(checkApi, 15000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(healthInterval);
    };
  }, [language]);

  const clearanceLabel = user?.role === 'admin' || user?.username === 'admin'
    ? t.common.administrator
    : user?.role === 'viewer'
    ? t.common.viewer
    : t.common.operator;

  const clearanceColor = user?.role === 'admin' || user?.username === 'admin'
    ? 'var(--accent-red)'
    : user?.role === 'viewer'
    ? '#38bdf8'
    : 'var(--accent-amber)';

  return (
    <>
      {/* CCTV Dynamic Ticker Banner */}
      <div className="ticker-wrapper" aria-label="CCTV Status Banner">
        <div className="ticker-track">
          <div className="ticker-item">
            <span>{t.navbar.ticker1}</span>
            <span>•</span>
            <span>{t.navbar.ticker2}</span>
            <span>•</span>
            <span>{t.navbar.ticker3}</span>
            <span>•</span>
            <span>{t.navbar.ticker4}</span>
            <span>•</span>
            <span>{t.navbar.ticker5}</span>
          </div>
          <div className="ticker-item">
            <span>{t.navbar.ticker1}</span>
            <span>•</span>
            <span>{t.navbar.ticker2}</span>
            <span>•</span>
            <span>{t.navbar.ticker3}</span>
            <span>•</span>
            <span>{t.navbar.ticker4}</span>
            <span>•</span>
            <span>{t.navbar.ticker5}</span>
          </div>
        </div>
      </div>

      {/* Main Top Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 9, 13, 0.94)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-party)',
        padding: '0 16px',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
        gap: '12px'
      }}>
        {/* Brand & CCTV Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div 
            onClick={() => onNavigate('grid')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 }}
          >
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(190, 18, 60, 0.25), rgba(225, 29, 72, 0.15))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(225, 29, 72, 0.35)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              flexShrink: 0,
              padding: '4px',
              overflow: 'hidden'
            }}>
              <img 
                src="/favicon.svg" 
                alt="Big Brother CCTV Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '0.95rem',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#fff',
                whiteSpace: 'nowrap'
              }}>
                TELESCREEN <span style={{
                  color: '#fff',
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  padding: '1px 5px',
                  background: 'var(--accent-red)',
                  borderRadius: '3px',
                  letterSpacing: '0.06em'
                }}>CCTV</span>
              </div>
              <div className="desktop-only" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {t.navbar.controlPanel}
              </div>
            </div>
          </div>

          {/* Status Pill */}
          <div className="desktop-only" style={{
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: apiOnline ? 'rgba(225, 29, 72, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${apiOnline ? 'rgba(225, 29, 72, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            fontSize: '0.68rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: apiOnline ? 'var(--text-party)' : 'var(--accent-amber)',
          }}>
            <span className={apiOnline ? 'pulse-red' : ''} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: apiOnline ? 'var(--accent-red)' : 'var(--accent-amber)',
            }} />
            <span>{apiOnline ? t.common.online : t.common.offline}</span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="desktop-only" style={{ alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavigate('grid')}
            className="btn-ghost"
            style={{
              background: currentView === 'grid' ? 'rgba(225, 29, 72, 0.16)' : 'transparent',
              color: currentView === 'grid' ? '#fff' : 'var(--text-secondary)',
              borderColor: currentView === 'grid' ? 'var(--accent-red)' : 'transparent',
              textTransform: 'uppercase',
            }}
          >
            <Radio size={15} color={currentView === 'grid' ? 'var(--accent-red)' : 'var(--text-secondary)'} />
            {t.navbar.liveCameras}
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className="btn-ghost"
            style={{
              background: currentView === 'admin' ? 'rgba(225, 29, 72, 0.16)' : 'transparent',
              color: currentView === 'admin' ? '#fff' : 'var(--text-secondary)',
              borderColor: currentView === 'admin' ? 'var(--accent-red)' : 'transparent',
              textTransform: 'uppercase',
            }}
          >
            <Terminal size={15} color={currentView === 'admin' ? 'var(--accent-red)' : 'var(--text-secondary)'} />
            {t.navbar.cameraManagement}
          </button>

          {user?.role !== 'viewer' && (
            <button
              onClick={() => onNavigate('users')}
              className="btn-ghost"
              style={{
                background: currentView === 'users' ? 'rgba(225, 29, 72, 0.16)' : 'transparent',
                color: currentView === 'users' ? '#fff' : 'var(--text-secondary)',
                borderColor: currentView === 'users' ? 'var(--accent-red)' : 'transparent',
                textTransform: 'uppercase',
              }}
            >
              <Users size={15} color={currentView === 'users' ? 'var(--accent-red)' : 'var(--text-secondary)'} />
              {t.navbar.users}
            </button>
          )}
        </nav>

        {/* Right Info: Language Selector, Clock, User Clearance & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Selector de idioma */}
          <LanguageSelector />

          <div className="desktop-only" style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textAlign: 'right'
          }}>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>BIG BROTHER</div>
            <div>{time}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                maxWidth: '110px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.name || user?.username || t.common.user}
              </div>
              <div style={{
                fontSize: '0.62rem',
                color: clearanceColor,
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                {clearanceLabel}
              </div>
            </div>

            <button
              onClick={onLogout}
              title={t.navbar.logout}
              className="btn-ghost"
              style={{ padding: '7px', borderRadius: '6px' }}
            >
              <LogOut size={16} color="var(--accent-red)" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly & Safe Area) */}
      <nav className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 'calc(58px + env(safe-area-inset-bottom, 0px))',
        background: 'rgba(10, 12, 17, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-party)',
        zIndex: 99,
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
        padding: '0 8px',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <button
          onClick={() => onNavigate('grid')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'transparent',
            border: 'none',
            color: currentView === 'grid' ? '#fff' : 'var(--text-muted)',
            padding: '6px 4px',
            position: 'relative'
          }}
        >
          {currentView === 'grid' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              background: 'var(--accent-red)',
              boxShadow: '0 0 8px var(--accent-red)'
            }} />
          )}
          <Radio size={18} color={currentView === 'grid' ? 'var(--accent-red)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.68rem', fontWeight: currentView === 'grid' ? 800 : 500, fontFamily: 'var(--font-display)' }}>
            {t.navbar.live}
          </span>
        </button>

        <button
          onClick={() => onNavigate('admin')}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3px',
            background: 'transparent',
            border: 'none',
            color: currentView === 'admin' ? '#fff' : 'var(--text-muted)',
            padding: '6px 4px',
            position: 'relative'
          }}
        >
          {currentView === 'admin' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '20%',
              right: '20%',
              height: '2px',
              background: 'var(--accent-red)',
              boxShadow: '0 0 8px var(--accent-red)'
            }} />
          )}
          <Terminal size={18} color={currentView === 'admin' ? 'var(--accent-red)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '0.68rem', fontWeight: currentView === 'admin' ? 800 : 500, fontFamily: 'var(--font-display)' }}>
            {t.navbar.cameras}
          </span>
        </button>

        {user?.role !== 'viewer' && (
          <button
            onClick={() => onNavigate('users')}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              background: 'transparent',
              border: 'none',
              color: currentView === 'users' ? '#fff' : 'var(--text-muted)',
              padding: '6px 4px',
              position: 'relative'
            }}
          >
            {currentView === 'users' && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                right: '20%',
                height: '2px',
                background: 'var(--accent-red)',
                boxShadow: '0 0 8px var(--accent-red)'
              }} />
            )}
            <Users size={18} color={currentView === 'users' ? 'var(--accent-red)' : 'var(--text-muted)'} />
            <span style={{ fontSize: '0.68rem', fontWeight: currentView === 'users' ? 800 : 500, fontFamily: 'var(--font-display)' }}>
              {t.navbar.users}
            </span>
          </button>
        )}
      </nav>
    </>
  );
};
