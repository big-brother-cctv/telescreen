import React, { useState } from 'react';
import type { Camera } from '../types';
import { VideoPlayer } from '../components/VideoPlayer';
import { LayoutGrid, Grid2X2, Grid3X3, Square, Plus, Search, RefreshCw, EyeOff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LiveGridProps {
  cameras: Camera[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddCamera: () => void;
}

export const LiveGrid: React.FC<LiveGridProps> = ({ cameras, isLoading, onRefresh, onAddCamera }) => {
  const { t } = useLanguage();
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
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        marginBottom: '18px',
      }}>
        {/* Title & Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff', margin: 0 }}>
            {t.liveGrid.title}
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
            {filteredCameras.length} {filteredCameras.length === 1 ? t.liveGrid.activeSingle : t.liveGrid.activePlural}
          </span>
        </div>

        {/* Toolbar: Compact Tactical Search, Grid switcher, Refresh, Add */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Compact Tactical Search */}
          <div style={{ position: 'relative', width: '160px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.liveGrid.searchPlaceholder}
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

          {/* CCTV Grid Layout Switcher */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(10, 13, 19, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '6px',
            padding: '2px',
            gap: '2px'
          }}>
            <button
              onClick={() => setLayout('auto')}
              title={t.liveGrid.layoutAuto}
              style={{
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                background: layout === 'auto' ? 'var(--accent-red)' : 'transparent',
                color: layout === 'auto' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setLayout('1x1')}
              title={t.liveGrid.layout1x1}
              style={{
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                background: layout === '1x1' ? 'var(--accent-red)' : 'transparent',
                color: layout === '1x1' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Square size={15} />
            </button>
            <button
              onClick={() => setLayout('2x2')}
              title={t.liveGrid.layout2x2}
              style={{
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                background: layout === '2x2' ? 'var(--accent-red)' : 'transparent',
                color: layout === '2x2' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid2X2 size={15} />
            </button>
            <button
              onClick={() => setLayout('3x3')}
              title={t.liveGrid.layout3x3}
              style={{
                padding: '4px 6px',
                border: 'none',
                borderRadius: '4px',
                background: layout === '3x3' ? 'var(--accent-red)' : 'transparent',
                color: layout === '3x3' ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Grid3X3 size={15} />
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="btn-ghost"
            title={t.liveGrid.refreshTooltip}
            style={{ height: '34px', width: '34px', padding: 0, justifyContent: 'center' }}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          </button>

          {/* Add Camera */}
          <button
            onClick={onAddCamera}
            className="btn-primary"
            style={{ height: '34px', padding: '0 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
          >
            <Plus size={15} />
            <span>{t.liveGrid.addCamera}</span>
          </button>
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
            {t.liveGrid.noCamerasTitle}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '20px', lineHeight: 1.6 }}>
            {search
              ? t.liveGrid.noCamerasSearch.replace('{query}', search)
              : t.liveGrid.noCamerasDesc}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={onAddCamera} className="btn-primary">
              <Plus size={16} />
              {t.liveGrid.addCamera}
            </button>
            <button onClick={onRefresh} className="btn-ghost">
              <RefreshCw size={14} />
              {t.liveGrid.checkFeeds}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
