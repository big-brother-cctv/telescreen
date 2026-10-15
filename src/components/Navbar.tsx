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

      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(8, 9, 13, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-party)',
        padding: '0 24px',
        height: '68px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)',
      }}>
        {/* Brand & All-Seeing Eye */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div 
            onClick={() => onNavigate('grid')}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #be123c, #e11d48)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 18px rgba(225, 29, 72, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <Eye size={24} color="#fff" />
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '1.05rem',
                letterSpacing: '0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#fff'
              }}>
                TELESCREEN <span style={{
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 6px',
                  background: 'var(--accent-red)',
                  borderRadius: '3px',
                  letterSpacing: '0.08em'
                }}>INGSOC 1984</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                MINISTRY OF TRUTH // SURVEILLANCE DIVISION
              </div>
            </div>
          </div>

          {/* Thought Police Status Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: apiOnline ? 'rgba(225, 29, 72, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            border: `1px solid ${apiOnline ? 'rgba(225, 29, 72, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
            fontSize: '0.7rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: apiOnline ? 'var(--text-party)' : 'var(--accent-amber)',
            letterSpacing: '0.05em'
          }}>
            <span className={apiOnline ? 'pulse-red' : ''} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: apiOnline ? 'var(--accent-red)' : 'var(--accent-amber)',
            }} />
            {apiOnline ? 'BIG BROTHER IS WATCHING' : 'LINK INTERRUPTED'}
          </div>
        </div>

        {/* Navigation tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        </nav>

        {/* Timestamp & Operator Clearance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            textAlign: 'right'
          }}>
            <div style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>YEAR 1984</div>
            <div>{time}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase' }}>
                {user?.name || user?.username || 'Camarada'}
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                INNER PARTY CLEARANCE
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Desconectar Telepantalla"
              className="btn-ghost"
              style={{ padding: '8px', borderRadius: '6px' }}
            >
              <LogOut size={16} color="var(--accent-red)" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};
