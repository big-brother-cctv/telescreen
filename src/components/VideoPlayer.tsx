import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, Minimize2, Camera as CameraIcon, RefreshCw, AlertCircle, Radio, Terminal, X } from 'lucide-react';
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

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

  // Escuchar cambios de fullscreen nativo (navegadores de escritorio y Android)
  useEffect(() => {
    const onFullscreenChange = () => {
      const isCurrent = Boolean(
        document.fullscreenElement === containerRef.current ||
        (document as any).webkitFullscreenElement === containerRef.current ||
        (document as any).webkitCurrentFullScreenElement === containerRef.current
      );
      setIsFullscreen(isCurrent);
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreenMode();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isFullscreen]);

  const exitFullscreenMode = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    } else if ((document as any).webkitFullscreenElement && (document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (!container) return;

    if (isFullscreen || document.fullscreenElement || (document as any).webkitFullscreenElement) {
      exitFullscreenMode();
      return;
    }

    // 1. Intentar API estándar de pantalla completa
    if (container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        // En móviles donde requestFullscreen en div es rechazado (ej. iOS Safari), usar fallback
        fallbackFullscreen(video);
      });
    } else if ((container as any).webkitRequestFullscreen) {
      try {
        (container as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } catch {
        fallbackFullscreen(video);
      }
    } else {
      fallbackFullscreen(video);
    }
  };

  const fallbackFullscreen = (video: HTMLVideoElement | null) => {
    // Si es iOS Safari con soporte nativo de webkitEnterFullscreen en <video>
    if (video && (video as any).webkitEnterFullscreen) {
      try {
        (video as any).webkitEnterFullscreen();
        setIsFullscreen(true);
        return;
      } catch {}
    }
    // Si no, aplicar modo pseudo-fullscreen táctico garantizado para cualquier móvil
    setIsFullscreen(true);
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
      link.download = `CCTV_SNAPSHOT_${camera.name}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`glass-panel ${isFullscreen ? 'player-fullscreen' : ''}`}
      style={{
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isFullscreen ? '0' : '8px',
        border: isFullscreen ? 'none' : '1px solid var(--border-party)',
        background: '#090b10',
        boxShadow: isFullscreen ? 'none' : '0 8px 30px rgba(0, 0, 0, 0.65)',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!isFullscreen) {
          e.currentTarget.style.borderColor = 'var(--accent-red)';
          e.currentTarget.style.boxShadow = '0 8px 32px rgba(225, 29, 72, 0.25)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isFullscreen) {
          e.currentTarget.style.borderColor = 'var(--border-party)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.65)';
        }
      }}
    >
      {/* Botón flotante para salir de pantalla completa (especialmente útil en móviles) */}
      {isFullscreen && (
        <button
          onClick={exitFullscreenMode}
          title="Salir de pantalla completa"
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            zIndex: 9999,
            background: 'rgba(225, 29, 72, 0.9)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '6px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
          <span>SALIR</span>
        </button>
      )}

      {/* Video Stream Area con efecto Scanlines */}
      <div 
        className="telescreen-frame" 
        style={{ 
          width: '100%', 
          aspectRatio: isFullscreen ? 'auto' : '16/9', 
          height: isFullscreen ? '100%' : 'auto',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          onPlaying={() => { setIsPlaying(true); setHasError(false); }}
          onWaiting={() => setIsPlaying(false)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* HUD Overlay - Top Bar */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '10px',
          right: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
          zIndex: 20,
          gap: '8px',
        }}>
          {/* Live indicator con texto adaptado para móvil */}
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
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}>
            <span className={isPlaying ? 'pulse-red' : ''} style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: isPlaying ? '#10b981' : '#f59e0b',
              flexShrink: 0
            }} />
            <span className="desktop-only">
              {isPlaying ? 'TELESCREEN EN DIRECTO' : (camera.status === 'online' ? 'SINTONIZANDO SEÑAL' : 'EN ESPERA')}
            </span>
            <span className="mobile-only">
              {isPlaying ? 'EN DIRECTO' : 'ESPERA'}
            </span>
          </div>

          {/* Badges de señal - Solo modo en móvil, resolución/fps en escritorio */}
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              padding: '2px 6px',
              borderRadius: '3px',
              background: camera.connectionMode === 'pull' ? 'rgba(56, 189, 248, 0.2)' : camera.connectionMode === 'push' ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: camera.connectionMode === 'pull' ? 'var(--accent-cyan)' : camera.connectionMode === 'push' ? '#c084fc' : '#fff',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              whiteSpace: 'nowrap'
            }}>
              {camera.connectionMode === 'pull' ? 'IP PULL' : camera.connectionMode === 'push' ? 'PUSH' : camera.sourceType?.toUpperCase() || 'LOCAL'}
            </span>
            
            {/* Ocultar en móvil para evitar apelotonamiento */}
            <span className="cam-info-extended" style={{
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
            <span className="cam-info-extended" style={{
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

        {/* Watermark sutil - Oculto en móvil */}
        <div className="cam-watermark" style={{
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
          BIG BROTHER CCTV // NODE #{camera.id || 1}
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
            gap: '10px',
            padding: '16px',
            textAlign: 'center',
            zIndex: 15,
          }}>
            {hasError ? (
              <>
                <AlertCircle size={28} color="var(--accent-red)" />
                <div style={{ fontSize: '0.825rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                  SIN EMISIÓN ACTIVA
                </div>
                <div className="desktop-only" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '280px' }}>
                  Esperando flujo de vídeo en <code className="mono">{streamUrl}</code>
                </div>
                <button
                  onClick={setupPlayer}
                  className="btn-ghost"
                  style={{ fontSize: '0.72rem', padding: '5px 10px', marginTop: '4px' }}
                >
                  <RefreshCw size={12} />
                  Reconectar Señal
                </button>
              </>
            ) : (
              <>
                <Radio size={26} color="var(--accent-red)" className="animate-spin" />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                  SINTONIZANDO TRANSMISIÓN...
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
          gap: '4px',
          background: 'rgba(10, 12, 18, 0.88)',
          backdropFilter: 'blur(8px)',
          padding: '4px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(225, 29, 72, 0.3)',
          zIndex: 25,
        }}>
          <button
            onClick={() => setShowStats(!showStats)}
            title="Telemetría técnica"
            className="btn-ghost"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <Terminal size={15} color={showStats ? 'var(--accent-red)' : 'var(--text-secondary)'} />
          </button>
          <button
            onClick={captureSnapshot}
            title="Guardar Snapshot"
            className="btn-ghost"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            <CameraIcon size={15} color="var(--text-secondary)" />
          </button>
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            className="btn-ghost"
            style={{ padding: '6px', border: 'none', background: 'transparent' }}
          >
            {isFullscreen ? (
              <Minimize2 size={15} color="var(--accent-red)" />
            ) : (
              <Maximize2 size={15} color="var(--text-secondary)" />
            )}
          </button>
        </div>
      </div>

      {/* Camera Info Footer - Limpio y despejado en móvil */}
      {!isFullscreen && (
        <div style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          gap: '10px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '0.875rem', 
              color: '#fff', 
              fontFamily: 'var(--font-display)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <span>{camera.name.toUpperCase()}</span>
              <span className="cam-info-extended" style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                [{camera.device || '/dev/video0'}]
              </span>
            </div>
            
            {/* Ocultar en móvil para que la tarjeta sea minimalista y compacta */}
            <div className="cam-info-extended" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px', gap: '8px' }}>
              <span>CODEC: <b style={{ color: 'var(--text-secondary)' }}>{camera.codec || 'libx264'}</b></span>
              <span>•</span>
              <span>PRESET: <b style={{ color: 'var(--text-secondary)' }}>{camera.preset || 'ultrafast'}</b></span>
            </div>
          </div>

          <button
            onClick={setupPlayer}
            disabled={isRetrying}
            className="btn-ghost"
            style={{ padding: '6px 9px', fontSize: '0.72rem', flexShrink: 0 }}
            title="Reiniciar Transmisión"
          >
            <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
          </button>
        </div>
      )}

      {/* Telemetry drawer */}
      {showStats && !isFullscreen && (
        <div style={{
          padding: '10px 14px',
          background: '#040508',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.68rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-secondary)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '6px'
        }}>
          <div>BUFFER: <span style={{ color: 'var(--accent-red)' }}>{camera.buffer || '1000000'} BYTES</span></div>
          <div>ROTATION: <span style={{ color: 'var(--accent-amber)' }}>{camera.rotation || 0}°</span></div>
          <div>TUNE: <span style={{ color: 'var(--text-primary)' }}>{camera.tune || 'zerolatency'}</span></div>
          <div>NODE ID: <span style={{ color: 'var(--text-party)' }}>#CCTV-{camera.id}</span></div>
        </div>
      )}
    </div>
  );
};
