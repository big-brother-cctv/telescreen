import React, { useState } from 'react';
import type { Camera } from '../types';
import { Plus, Edit2, Trash2, Search, Radio, LayoutGrid, List, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CamerasAdminProps {
  cameras: Camera[];
  onAdd: () => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: number) => Promise<void>;
}

export const CamerasAdmin: React.FC<CamerasAdminProps> = ({ cameras, onAdd, onEdit, onDelete }) => {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = cameras.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.device.toLowerCase().includes(search.toLowerCase()) ||
    c.codec.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(t.camerasAdmin.deleteConfirm.replace('{name}', name))) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getModeLabel = (mode?: string) => {
    switch (mode) {
      case 'pull': return t.camerasAdmin.modeIpPull;
      case 'push': return t.camerasAdmin.modePush;
      case 'test': return t.camerasAdmin.modeTest;
      default: return t.camerasAdmin.modeUsb;
    }
  };

  return (
    <div className="responsive-container">
      {/* Header */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '18px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.02em', margin: 0 }}>
            {t.camerasAdmin.title}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', marginBottom: 0 }}>
            {t.camerasAdmin.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Compact Tactical Search */}
          <div style={{ position: 'relative', width: '160px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.camerasAdmin.searchPlaceholder}
              style={{
                width: '100%',
                paddingLeft: '28px',
                paddingRight: '8px',
                height: '34px',
                fontSize: '0.78rem',
                borderRadius: '6px',
                background: 'rgba(10, 13, 19, 0.75)',
                border: '1px solid var(--border-subtle)'
              }}
            />
          </div>

          {/* Desktop View Switcher */}
          <div className="desktop-only" style={{
            background: 'rgba(12, 15, 22, 0.85)',
            border: '1px solid var(--border-party)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px'
          }}>
            <button
              onClick={() => setViewMode('cards')}
              title={language === 'es' ? 'Vista Tarjetas' : 'Cards View'}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'cards' ? 'var(--accent-red)' : 'transparent',
                color: viewMode === 'cards' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <LayoutGrid size={13} />
              <span>{language === 'es' ? 'Tarjetas' : 'Cards'}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title={language === 'es' ? 'Vista Tabla' : 'Table View'}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: 'none',
                background: viewMode === 'table' ? 'var(--accent-red)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              <List size={13} />
              <span>{language === 'es' ? 'Tabla' : 'Table'}</span>
            </button>
          </div>

          <button onClick={onAdd} className="btn-primary" style={{ height: '34px', padding: '0 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
            <Plus size={15} />
            <span>{t.camerasAdmin.newCamera}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View (Only if viewMode is table) */}
      {viewMode === 'table' && (
        <div className="table-desktop-view glass-panel brutalist-border" style={{ overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{
                background: 'rgba(225, 29, 72, 0.08)',
                borderBottom: '1px solid var(--border-party)',
                color: '#fda4af',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-display)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                <th style={{ padding: '14px 18px' }}>{t.camerasAdmin.colStatus}</th>
                <th style={{ padding: '14px 18px' }}>{t.camerasAdmin.colCamera}</th>
                <th style={{ padding: '14px 18px' }}>{t.camerasAdmin.colTypeMode}</th>
                <th style={{ padding: '14px 18px' }}>{t.camerasAdmin.colSource}</th>
                <th style={{ padding: '14px 18px' }}>CÓDEC</th>
                <th style={{ padding: '14px 18px' }}>DETECCIÓN MOTION</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>{t.camerasAdmin.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((cam) => {
                  const isOnline = cam.status === 'online';
                  const isStandby = cam.status === 'standby';
                  return (
                    <tr
                      key={cam.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(225, 29, 72, 0.04)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Estado en Vivo */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: isOnline ? 'rgba(16, 185, 129, 0.15)' : isStandby ? 'rgba(245, 158, 11, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                          border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : isStandby ? 'rgba(245, 158, 11, 0.4)' : 'rgba(225, 29, 72, 0.4)'}`,
                          fontSize: '0.65rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: isOnline ? '#34d399' : isStandby ? '#fbbf24' : '#f87171'
                        }}>
                          <span className={isOnline ? 'pulse-red' : ''} style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: isOnline ? '#10b981' : isStandby ? '#f59e0b' : '#ef4444'
                          }} />
                          {isOnline ? t.common.online : isStandby ? t.common.standby : t.common.offline}
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '4px',
                            background: 'rgba(225, 29, 72, 0.15)',
                            border: '1px solid rgba(225, 29, 72, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Radio size={14} color="var(--accent-red)" />
                          </div>
                          <div>
                            <span style={{ fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                              {cam.name.toUpperCase()}
                            </span>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                              ID: #{cam.id}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Modo & Conexión */}
                      <td style={{ padding: '16px 18px' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: cam.connectionMode === 'pull' ? 'rgba(56, 189, 248, 0.15)' : cam.connectionMode === 'push' ? 'rgba(168, 85, 247, 0.15)' : cam.connectionMode === 'test' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: cam.connectionMode === 'pull' ? 'var(--accent-cyan)' : cam.connectionMode === 'push' ? '#c084fc' : cam.connectionMode === 'test' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                          border: `1px solid ${cam.connectionMode === 'pull' ? 'rgba(56, 189, 248, 0.3)' : cam.connectionMode === 'push' ? 'rgba(168, 85, 247, 0.3)' : cam.connectionMode === 'test' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.15)'}`
                        }}>
                          {getModeLabel(cam.connectionMode)}
                        </span>
                      </td>

                      {/* Source / Device */}
                      <td style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cam.sourceUrl || (cam.connectionMode === 'push' ? `rtmp://mediamtx:1935/${cam.name}` : cam.device || '')}>
                        {cam.sourceUrl ? (
                          <span style={{ color: 'var(--accent-cyan)' }}>{cam.sourceUrl}</span>
                        ) : cam.connectionMode === 'push' ? (
                          <span style={{ color: '#c084fc' }}>rtmp://.../{cam.name}</span>
                        ) : cam.connectionMode === 'test' || cam.sourceType === 'test' ? (
                          <span style={{ color: 'var(--accent-amber)' }}>SMPTE Synthetic</span>
                        ) : (
                          cam.device || '/dev/video0'
                        )}
                      </td>

                      {/* Resolution & FPS */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: '#090d15',
                            border: '1px solid var(--border-subtle)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: '#fff'
                          }}>
                            {cam.resolution || '640x480'}
                          </span>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: 'rgba(225, 29, 72, 0.15)',
                            border: '1px solid rgba(225, 29, 72, 0.3)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.72rem',
                            color: '#fda4af'
                          }}>
                            {cam.fps || 25} FPS
                          </span>
                        </div>
                      </td>

                      {/* Codec */}
                      <td style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)' }}>
                        {cam.codec || 'libx264'}
                      </td>

                      {/* Motion Detection */}
                      <td style={{ padding: '16px 18px' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: cam.motionEnabled !== false ? 'rgba(225, 29, 72, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${cam.motionEnabled !== false ? 'rgba(225, 29, 72, 0.35)' : 'var(--border-subtle)'}`,
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          color: cam.motionEnabled !== false ? '#fff' : 'var(--text-muted)',
                        }}>
                          <ShieldAlert size={12} color={cam.motionEnabled !== false ? 'var(--accent-red)' : 'var(--text-muted)'} />
                          <span>{cam.motionEnabled !== false ? `ACTIVA (${cam.motionThreshold || 350}px)` : 'PAUSADA'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => onEdit(cam)}
                            title={t.common.edit}
                            className="btn-ghost"
                            style={{ padding: '6px' }}
                          >
                            <Edit2 size={14} color="var(--accent-amber)" />
                          </button>
                          <button
                            onClick={() => handleDelete(cam.id, cam.name)}
                            disabled={deletingId === cam.id}
                            title={t.common.delete}
                            className="btn-danger"
                            style={{ padding: '6px' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {t.camerasAdmin.noCameras}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Cards View (Cards on PC when selected, and always on Mobile) */}
      <div className={viewMode === 'table' ? 'mobile-only cards-grid-view' : 'cards-grid-view'}>
        {filtered.length > 0 ? (
          filtered.map((cam) => {
            const isOnline = cam.status === 'online';
            const isStandby = cam.status === 'standby';
            return (
              <div key={cam.id} className="mobile-entity-card">
                {/* Header: Icon + Name + Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '6px',
                      background: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(225, 29, 72, 0.15)',
                      border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : 'rgba(225, 29, 72, 0.4)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Radio size={16} color={isOnline ? '#34d399' : 'var(--accent-red)'} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff', fontFamily: 'var(--font-display)', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cam.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                        ID: #{cam.id}
                      </div>
                    </div>
                  </div>

                  {/* Status & Mode badges */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      padding: '2px 8px',
                      borderRadius: '3px',
                      background: isOnline ? 'rgba(16, 185, 129, 0.2)' : isStandby ? 'rgba(245, 158, 11, 0.2)' : 'rgba(225, 29, 72, 0.2)',
                      color: isOnline ? '#34d399' : isStandby ? '#fbbf24' : '#f87171',
                      border: `1px solid ${isOnline ? 'rgba(16, 185, 129, 0.4)' : isStandby ? 'rgba(245, 158, 11, 0.4)' : 'rgba(225, 29, 72, 0.4)'}`
                    }}>
                      {isOnline ? t.common.online : isStandby ? t.common.standby : t.common.offline}
                    </span>
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: '3px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {getModeLabel(cam.connectionMode)}
                    </span>
                  </div>
                </div>

                {/* Source URL / Device */}
                <div style={{
                  background: '#07090e',
                  padding: '8px 10px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.72rem',
                  fontFamily: 'var(--font-mono)',
                  wordBreak: 'break-all',
                  color: cam.sourceUrl ? 'var(--accent-cyan)' : 'var(--text-secondary)'
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.62rem', display: 'block', marginBottom: '2px', textTransform: 'uppercase' }}>
                    {cam.sourceUrl ? 'URL RTSP / STREAM' : cam.connectionMode === 'push' ? 'INGESTA PUSH (RTMP)' : cam.connectionMode === 'test' ? 'GENERADOR' : 'DISPOSITIVO'}
                  </span>
                  {cam.sourceUrl || (cam.connectionMode === 'push' ? `rtmp://.../${cam.name}` : cam.connectionMode === 'test' ? 'SMPTE Test Pattern' : (cam.device || '/dev/video0'))}
                </div>

                {/* Parameters row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '3px', color: '#fff' }}>
                    {cam.resolution || '1280x720'}
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(225,29,72,0.12)', border: '1px solid rgba(225,29,72,0.3)', borderRadius: '3px', color: '#fda4af' }}>
                    {cam.fps || 25} FPS
                  </span>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '3px', color: 'var(--accent-amber)' }}>
                    {cam.codec || 'libx264'}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {cam.preset || 'ultrafast'} • {cam.tune || 'zerolatency'}
                  </span>
                </div>

                {/* Motion badge in card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.68rem',
                  fontFamily: 'var(--font-mono)',
                  color: cam.motionEnabled !== false ? '#fff' : 'var(--text-muted)',
                  background: cam.motionEnabled !== false ? 'rgba(225, 29, 72, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${cam.motionEnabled !== false ? 'rgba(225, 29, 72, 0.3)' : 'var(--border-subtle)'}`,
                }}>
                  <ShieldAlert size={12} color={cam.motionEnabled !== false ? 'var(--accent-red)' : 'var(--text-muted)'} />
                  <span>Detección Motion: {cam.motionEnabled !== false ? `Activa (${cam.motionThreshold || 350}px - ${cam.motionFrames || 2}f)` : 'Pausada'}</span>
                </div>

                {/* Actions row: Touch friendly */}
                <div style={{ display: 'flex', gap: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => onEdit(cam)}
                    className="btn-ghost"
                    style={{ flex: 1, padding: '9px 12px', fontSize: '0.78rem', justifyContent: 'center', minHeight: '40px' }}
                  >
                    <Edit2 size={14} color="var(--accent-amber)" />
                    <span>{t.common.edit}</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cam.id, cam.name)}
                    disabled={deletingId === cam.id}
                    className="btn-danger"
                    style={{ padding: '9px 16px', fontSize: '0.78rem', minHeight: '40px' }}
                  >
                    <Trash2 size={14} />
                    <span>{t.common.delete}</span>
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-panel" style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {t.camerasAdmin.noCameras}
          </div>
        )}
      </div>
    </div>
  );
};
