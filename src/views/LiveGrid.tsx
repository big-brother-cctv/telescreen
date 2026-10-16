import React, { useState } from 'react';
import type { Camera } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { LayoutGrid, Grid2X2, Grid3X3, Square, Plus, Search, RefreshCw, EyeOff } from 'lucide-react';

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

  return (
    <div className="responsive-container">
      {/* Top Bar / Controls */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        marginBottom: '20px',
      }}>
        {/* Title & Counter */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff' }}>
              Cámaras en Directo
            </h1>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(225, 29, 72, 0.2)',
              color: 'var(--text-party)',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              fontFamily: 'var(--font-mono)'
            }}>
              {filteredCameras.length} {filteredCameras.length === 1 ? 'ACTIVA' : 'ACTIVAS'}
            </span>
          </div>
          <p className="desktop-only" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            TRANSMISIÓN CONTINUA • CCTV EN VIVO
          </p>
        </div>

        {/* Actions & Filters: Responsive Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          flexWrap: 'wrap',
          width: '100%'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '180px', maxWidth: '420px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cámara o ubicación..."
              style={{ width: '100%', paddingLeft: '32px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', flex: '1 0 auto' }}>
            {/* CCTV Grid Layout Switcher */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '2px',
              gap: '2px'
            }}>
              <button
                onClick={() => setLayout('auto')}
                title="Mosaico Automático Fluido"
                className="btn-ghost"
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '4px',
                  background: layout === 'auto' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                  color: layout === 'auto' ? '#fff' : 'var(--text-muted)',
                }}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setLayout('1x1')}
                title="Vista 1x1 (1 Columna Grande)"
                className="btn-ghost"
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '4px',
                  background: layout === '1x1' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                  color: layout === '1x1' ? '#fff' : 'var(--text-muted)',
                }}
              >
                <Square size={16} />
              </button>
              <button
                onClick={() => setLayout('2x2')}
                title="Cuadrícula 2x2 (2 Columnas fijas)"
                className="btn-ghost"
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '4px',
                  background: layout === '2x2' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                  color: layout === '2x2' ? '#fff' : 'var(--text-muted)',
                }}
              >
                <Grid2X2 size={16} />
              </button>
              <button
                onClick={() => setLayout('3x3')}
                title="Cuadrícula 3x3 (3 Columnas)"
                className="btn-ghost"
                style={{
                  padding: '6px',
                  border: 'none',
                  borderRadius: '4px',
                  background: layout === '3x3' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                  color: layout === '3x3' ? '#fff' : 'var(--text-muted)',
                }}
              >
                <Grid3X3 size={16} />
              </button>
            </div>

            {/* Refresh */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="btn-ghost"
              title="Actualizar estado de transmisiones"
              style={{ padding: '8px' }}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            </button>

            {/* Add Camera */}
            <button
              onClick={onAddCamera}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap' }}
            >
              <Plus size={16} />
              <span>Añadir Cámara</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of video players with exact layout classes */}
      {filteredCameras.length > 0 ? (
        <div className={`cctv-grid-${layout}`}>
          {filteredCameras.map((camera) => (
            <VideoPlayer key={camera.id || camera.name} camera={camera} />
          ))}
        </div>
      ) : (
        <div className="glass-panel brutalist-border" style={{
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: '640px',
          margin: '30px auto',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: 'rgba(225, 29, 72, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            border: '1px solid rgba(225, 29, 72, 0.3)'
          }}>
            <EyeOff size={28} color="var(--accent-red)" />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', color: '#fff' }}>
            NO HAY CÁMARAS CONECTADAS
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px', lineHeight: 1.6 }}>
            {search
              ? `No se encontraron cámaras que coincidan con "${search}".`
              : 'Conecta cámaras IP (RTSP), emite en directo desde tu smartphone u OBS (Push), vincula una webcam local o inicia una señal de prueba.'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onAddCamera} className="btn-primary">
              <Plus size={16} />
              Añadir Nueva Cámara
            </button>
            <button onClick={onRefresh} className="btn-ghost">
              <RefreshCw size={14} />
              Comprobar Señales
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
