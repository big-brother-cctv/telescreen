import React, { useState } from 'react';
import type { Camera } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { LayoutGrid, Grid3X3, Square, Plus, Search, RefreshCw, EyeOff } from 'lucide-react';

interface LiveGridProps {
  cameras: Camera[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddCamera: () => void;
}

export const LiveGrid: React.FC<LiveGridProps> = ({ cameras, isLoading, onRefresh, onAddCamera }) => {
  const [layout, setLayout] = useState<'auto' | '1x1' | '2x2' | '3x3'>('auto');
  const [search, setSearch] = useState<string>('');

  const filteredCameras = cameras.filter(cam =>
    cam.name?.toLowerCase().includes(search.toLowerCase()) ||
    cam.device?.toLowerCase().includes(search.toLowerCase())
  );

  const getGridTemplate = () => {
    switch (layout) {
      case '1x1':
        return '1fr';
      case '2x2':
        return 'repeat(auto-fit, minmax(460px, 1fr))';
      case '3x3':
        return 'repeat(auto-fit, minmax(320px, 1fr))';
      default:
        return 'repeat(auto-fill, minmax(390px, 1fr))';
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1800px', margin: '0 auto' }}>
      {/* Top Bar / Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {/* Title & Counter */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff' }}>
              Matriz de Telepantallas
            </h1>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(225, 29, 72, 0.2)',
              color: 'var(--text-party)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              fontFamily: 'var(--font-mono)'
            }}>
              {filteredCameras.length} {filteredCameras.length === 1 ? 'CANAL ACTIVO' : 'CANALES ACTIVOS'}
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
            TRANSMISIÓN SIMULTÁNEA CONTINUA • PROTOCOLO INGSOC 1984
          </p>
        </div>

        {/* Actions & Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', width: '230px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Localizar sector / cámara..."
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>

          {/* Layout Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '2px',
          }}>
            <button
              onClick={() => setLayout('auto')}
              title="Mosaico Dinámico"
              className="btn-ghost"
              style={{
                padding: '6px',
                border: 'none',
                background: layout === 'auto' ? 'rgba(225, 29, 72, 0.2)' : 'transparent',
                color: layout === 'auto' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setLayout('2x2')}
              title="Cuadrícula Táctica 2x2"
              className="btn-ghost"
              style={{
                padding: '6px',
                border: 'none',
                background: layout === '2x2' ? 'rgba(225, 29, 72, 0.2)' : 'transparent',
                color: layout === '2x2' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setLayout('1x1')}
              title="Foco en Telepantalla Única"
              className="btn-ghost"
              style={{
                padding: '6px',
                border: 'none',
                background: layout === '1x1' ? 'rgba(225, 29, 72, 0.2)' : 'transparent',
                color: layout === '1x1' ? '#fff' : 'var(--text-muted)',
              }}
            >
              <Square size={16} />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-ghost"
            title="Refrescar Sintonía"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Add Camera */}
          <button
            onClick={onAddCamera}
            className="btn-primary"
          >
            <Plus size={16} />
            Asignar Telepantalla
          </button>
        </div>
      </div>

      {/* Grid of video players */}
      {filteredCameras.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: getGridTemplate(),
          gap: '20px',
        }}>
          {filteredCameras.map((camera) => (
            <VideoPlayer key={camera.id || camera.name} camera={camera} />
          ))}
        </div>
      ) : (
        <div className="glass-panel brutalist-border" style={{
          padding: '50px 24px',
          textAlign: 'center',
          maxWidth: '640px',
          margin: '40px auto',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(225, 29, 72, 0.3)'
          }}>
            <EyeOff size={30} color="var(--accent-red)" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#fff' }}>
            SECTOR A OSCURAS: NO HAY TELEPANTALLAS ACTIVAS
          </h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '24px', lineHeight: 1.6 }}>
            {search
              ? `No se detectaron emisiones que coincidan con "${search}".`
              : 'Big Brother necesita ojos en todos los sectores. Puedes autoconectar cámaras IP remotas (RTSP), emitir desde tu móvil u OBS (Push), desplegar un agente en Raspberry Pi o iniciar una señal de prueba.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={onAddCamera} className="btn-primary">
              <Plus size={16} />
              Enlazar Telepantalla Universal
            </button>
            <button onClick={onRefresh} className="btn-ghost">
              <RefreshCw size={14} />
              Buscar Señales Entrantes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
