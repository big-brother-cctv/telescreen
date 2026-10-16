import React, { useState } from 'react';
import type { Camera } from '../types';
import { Plus, Edit2, Trash2, Search, Radio } from 'lucide-react';

interface CamerasAdminProps {
  cameras: Camera[];
  onAdd: () => void;
  onEdit: (camera: Camera) => void;
  onDelete: (id: number) => Promise<void>;
}

export const CamerasAdmin: React.FC<CamerasAdminProps> = ({ cameras, onAdd, onEdit, onDelete }) => {
  const [search, setSearch] = useState<string>('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = cameras.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.device.toLowerCase().includes(search.toLowerCase()) ||
    c.codec.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar la cámara "${name}"?`)) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
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
        gap: '14px',
        marginBottom: '20px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '0.02em' }}>
            Gestión de Cámaras
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            CONFIGURACIÓN DE FUENTES DE VÍDEO, DISPOSITIVOS Y PARÁMETROS DE EMISIÓN
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end', minWidth: '260px' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px', maxWidth: '340px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por cámara o dispositivo..."
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>

          <button onClick={onAdd} className="btn-primary" style={{ whiteSpace: 'nowrap' }}>
            <Plus size={16} />
            <span>Nueva Cámara</span>
          </button>
        </div>
      </div>

      {/* Cameras Table Card */}
      <div className="glass-panel brutalist-border" style={{ overflow: 'hidden' }}>
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
                <th style={{ padding: '14px 18px' }}>Estado</th>
                <th style={{ padding: '14px 18px' }}>Cámara</th>
                <th style={{ padding: '14px 18px' }}>Tipo de Conexión</th>
                <th style={{ padding: '14px 18px' }}>Fuente / Dispositivo</th>
                <th style={{ padding: '14px 18px' }}>Resolución & FPS</th>
                <th style={{ padding: '14px 18px' }}>Códec</th>
                <th style={{ padding: '14px 18px' }}>Perfil</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Acciones</th>
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
                          {isOnline ? 'ONLINE' : isStandby ? 'STANDBY' : 'OFFLINE'}
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
                          {cam.connectionMode === 'pull' ? 'IP PULL' : cam.connectionMode === 'push' ? 'PUSH (MÓVIL/OBS)' : cam.connectionMode === 'test' ? 'TEST SINTÉTICO' : 'USB LOCAL'}
                        </span>
                      </td>

                    {/* Source / Device */}
                    <td style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cam.sourceUrl || cam.device || '/dev/video0'}>
                      {cam.sourceUrl ? (
                        <span style={{ color: 'var(--accent-cyan)' }}>{cam.sourceUrl}</span>
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

                    {/* Preset & Tune */}
                    <td style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                      <div>PRESET: <span style={{ color: '#fff' }}>{cam.preset || 'ultrafast'}</span></div>
                      <div>TUNE: <span style={{ color: 'var(--text-party)' }}>{cam.tune || 'zerolatency'}</span></div>
                    </td>

                    {/* Buffer */}
                    <td style={{ padding: '16px 18px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {cam.buffer || '1000000'}
                    </td>

                    {/* Rotation */}
                    <td style={{ padding: '16px 18px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        background: cam.rotation === '0' || !cam.rotation ? 'rgba(255, 255, 255, 0.05)' : 'rgba(245, 158, 11, 0.15)',
                        color: cam.rotation === '0' || !cam.rotation ? 'var(--text-muted)' : 'var(--accent-amber)',
                      }}>
                        {cam.rotation || 0}°
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => onEdit(cam)}
                          title="Editar cámara"
                          className="btn-ghost"
                          style={{ padding: '6px' }}
                        >
                          <Edit2 size={14} color="var(--accent-amber)" />
                        </button>
                        <button
                          onClick={() => handleDelete(cam.id, cam.name)}
                          disabled={deletingId === cam.id}
                          title="Eliminar cámara"
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
                    NO HAY CÁMARAS REGISTRADAS EN EL SISTEMA.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
