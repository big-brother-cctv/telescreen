import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, Camera as CameraIcon, RefreshCw, AlertCircle, Radio, Terminal } from 'lucide-react';
import type { Camera } from '../types';

interface VideoPlayerProps {
  camera: Camera;
  onEdit?: (camera: Camera) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);

  const streamUrl = `/stream/${camera.name}/index.m3u8`;

  const setupPlayer = () => {
    const video = videoRef.current;
    if (!video) return;

    setHasError(false);
    setIsRetrying(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 6,
        maxLiveSyncPlaybackRate: 1.5,
        enableWorker: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsRetrying(false);
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasError(true);
              setIsRetrying(false);
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {});
      setIsRetrying(false);
    } else {
      setHasError(true);
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    const cleanup = setupPlayer();
    return () => {
      if (cleanup) cleanup();
    };
  }, [camera.name]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const captureSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `INGSOC_SURVEILLANCE_${camera.name}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    }
  };

  return (
    <div
      ref={containerRef}
      className="glass-panel"
      style={{
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        border: '1px solid var(--border-party)',
        background: '#090b10',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.65)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-red)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(225, 29, 72, 0.25)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-party)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.65)';
      }}
    >
      {/* Video Stream Area con efecto Scanlines de Telepantalla */}
      <div className="telescreen-frame" style={{ width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          onPlaying={() => { setIsPlaying(true); setHasError(false); }}
          onWaiting={() => setIsPlaying(false)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* HUD Overlay - Top Bar estilo CCTV Militar 1984 */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '12px',
          right: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 20,
        }}>
          {/* Live indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '3px 8px',
            borderRadius: '4px',
            background: isPlaying ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${isPlaying ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)'}`,
            fontSize: '0.68rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: isPlaying ? '#34d399' : 'var(--accent-amber)',
            letterSpacing: '0.08em'
          }}>
            <span className={isPlaying ? 'pulse-red' : ''} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#10b981' : '#f59e0b',
            }} />
            {isPlaying ? 'TELESCREEN EN DIRECTO' : (camera.status === 'online' ? 'SINTONIZANDO SEÑAL' : 'ENLACE EN ESPERA')}
          </div>

          {/* Quick Badges */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {/* Mode badge */}
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '3px',
              background: camera.connectionMode === 'pull' ? 'rgba(56, 189, 248, 0.2)' : camera.connectionMode === 'push' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: camera.connectionMode === 'pull' ? 'var(--accent-cyan)' : camera.connectionMode === 'push' ? '#c084fc' : '#fff',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
              {camera.connectionMode === 'pull' ? 'IP PULL' : camera.connectionMode === 'push' ? 'PUSH' : camera.sourceType?.toUpperCase() || 'LOCAL'}
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 6px',
              background: 'rgba(0, 0, 0, 0.8)',
              borderRadius: '3px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              {camera.resolution || '640x480'}
            </span>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 700,
              padding: '2px 6px',
              background: 'rgba(225, 29, 72, 0.2)',
              borderRadius: '3px',
              color: '#fda4af',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(225, 29, 72, 0.4)'
            }}>
              {camera.fps ? `${camera.fps} FPS` : '25 FPS'}
            </span>
          </div>
        </div>

        {/* Watermark Oceania */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '12px',
          fontSize: '0.62rem',
          fontFamily: 'var(--font-mono)',
          color: 'rgba(255, 255, 255, 0.35)',
          letterSpacing: '0.1em',
          pointerEvents: 'none',
          zIndex: 20,
        }}>
          SECTOR 4 // OCEANIA WATCH // NODE #{camera.id || 1}
        </div>

        {/* Fallback / Connecting Screen */}
        {(!isPlaying || hasError) && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(6, 7, 10, 0.92)',
            color: 'var(--text-secondary)',
            gap: '12px',
            padding: '20px',
            textAlign: 'center',
            zIndex: 15,
          }}>
            {hasError ? (
              <>
                <AlertCircle size={32} color="var(--accent-red)" />
                <div style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                  CANAL DE TELEPANTALLA SIN EMISIÓN
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '280px' }}>
                  El nodo de vigilancia no está publicando en <code className="mono">{streamUrl}</code>
                </div>
                <button
                  onClick={setupPlayer}
                  className="btn-ghost"
                  style={{ fontSize: '0.72rem', padding: '4px 10px', marginTop: '6px' }}
                >
                  <RefreshCw size={12} />
                  Sintonizar Frecuencia
                </button>
              </>
            ) : (
              <>
                <Radio size={28} color="var(--accent-red)" className="animate-spin" />
                <div style={{ fontSize: '0.78rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
                  ESTABLECIENDO ENLACE CON LA TELEPANTALLA...
                </div>
              </>
            )}
          </div>
        )}

        {/* Controls Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          display: 'flex',
          gap: '6px',
          background: 'rgba(10, 12, 18, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '4px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(225, 29, 72, 0.3)',
          zIndex: 25,
        }}>
          <button
            onClick={() => setShowStats(!showStats)}
            title="Telemetría de Vigilancia"
            className="btn-ghost"
            style={{ padding: '4px', border: 'none', background: 'transparent' }}
          >
            <Terminal size={14} color={showStats ? 'var(--accent-red)' : 'var(--text-secondary)'} />
          </button>
          <button
            onClick={captureSnapshot}
            title="Archivar Evidencia Fotográfica"
            className="btn-ghost"
            style={{ padding: '4px', border: 'none', background: 'transparent' }}
          >
            <CameraIcon size={14} color="var(--text-secondary)" />
          </button>
          <button
            onClick={toggleFullscreen}
            title="Maximizar Telepantalla"
            className="btn-ghost"
            style={{ padding: '4px', border: 'none', background: 'transparent' }}
          >
            <Maximize2 size={14} color="var(--text-secondary)" />
          </button>
        </div>
      </div>

      {/* Camera Info Footer */}
      <div style={{
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.02em' }}>
            {camera.name.toUpperCase()}
            <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              [{camera.device || '/dev/video0'}]
            </span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', display: 'flex', gap: '8px' }}>
            <span>CODEC: <b style={{ color: 'var(--text-secondary)' }}>{camera.codec || 'libx264'}</b></span>
            <span>•</span>
            <span>PRESET: <b style={{ color: 'var(--text-secondary)' }}>{camera.preset || 'ultrafast'}</b></span>
          </div>
        </div>

        <button
          onClick={setupPlayer}
          disabled={isRetrying}
          className="btn-ghost"
          style={{ padding: '6px 10px', fontSize: '0.72rem' }}
          title="Reiniciar Transmisión"
        >
          <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Telemetry drawer */}
      {showStats && (
        <div style={{
          padding: '10px 14px',
          background: '#040508',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px'
        }}>
          <div>BUFFER: <span style={{ color: 'var(--accent-red)' }}>{camera.buffer || '1000000'} BYTES</span></div>
          <div>ROTATION: <span style={{ color: 'var(--accent-amber)' }}>{camera.rotation || 0}°</span></div>
          <div>TUNE: <span style={{ color: 'var(--text-primary)' }}>{camera.tune || 'zerolatency'}</span></div>
          <div>NODE ID: <span style={{ color: 'var(--text-party)' }}>#1984-{camera.id}</span></div>
        </div>
      )}
    </div>
  );
};
