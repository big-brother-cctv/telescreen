import React, { useState, useEffect } from 'react';
import { Eye, Users, LogOut, Radio, Terminal } from 'lucide-react';
import { api } from '../services/api';
import type { User } from '../types';

interface NavbarProps {
  currentView: 'grid' | 'admin' | 'users';
  onNavigate: (view: 'grid' | 'admin' | 'users') => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, user, onLogout }) => {
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('es-ES', { hour12: false }) + ' // AIRSTOCK-1');
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
  }, []);

  const clearanceLabel = user?.role === 'admin' || user?.username === 'admin'
    ? 'INNER PARTY'
    : user?.role === 'viewer'
    ? 'PROLE'
    : 'OUTER PARTY';

  const clearanceColor = user?.role === 'admin' || user?.username === 'admin'
    ? 'var(--accent-red)'
    : user?.role === 'viewer'
    ? '#38bdf8'
    : 'var(--accent-amber)';

  return (
    <>
      {/* Orwell Party Slogan Ticker */}
      <div className="slogan-banner">
        <span>WAR IS PEACE</span>
        <span>•</span>
        <span>FREEDOM IS SLAVERY</span>
        <span>•</span>
        <span>IGNORANCE IS STRENGTH</span>
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
        {/* Brand & All-Seeing Eye */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div 
            onClick={() => onNavigate('grid')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', minWidth: 0 }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #be123c, #e11d48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(225, 29, 72, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              flexShrink: 0
            }}>
              <Eye size={20} color="#fff" />
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
                }}>1984</span>
              </div>
              <div className="desktop-only" style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                SURVEILLANCE TERMINAL
              </div>
            </div>
          </div>

          {/* Thought Police Status Pill */}
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
            <span>{apiOnline ? 'WATCHING' : 'OFFLINE'}</span>
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
            Matriz de Telepantallas
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
            Nodos de Vigilancia
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
              Miembros del Partido
            </button>
          )}
        </nav>

        {/* Right Info: Clock, User Clearance & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <div className="desktop-only" style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textAlign: 'right'
          }}>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>YEAR 1984</div>
            <div>{time}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                maxWidth: '120px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {user?.name || user?.username || 'Camarada'}
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
              title="Desconectar Telepantalla"
              className="btn-ghost"
              style={{ padding: '7px', borderRadius: '6px' }}
            >
              <LogOut size={16} color="var(--accent-red)" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Thumb Friendly) */}
      <nav className="mobile-only" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '58px',
        background: 'rgba(10, 12, 17, 0.96)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border-party)',
        zIndex: 99,
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)',
        padding: '0 8px'
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
            Matriz
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
            Nodos
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
              Censo
            </span>
          </button>
        )}
      </nav>
    </>
  );
};
