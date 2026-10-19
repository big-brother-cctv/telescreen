import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Maximize2, Minimize2, Camera as CameraIcon, RefreshCw, AlertCircle, Radio, Terminal, X } from 'lucide-react';
import type { Camera } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useAlerts } from '../context/AlertsContext';

interface VideoPlayerProps {
  camera: Camera;
  onEdit?: (camera: Camera) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ camera }) => {
  const { t } = useLanguage();
  const { activeAlertCameras, setIsDrawerOpen } = useAlerts();
  const hasActiveAlarm = activeAlertCameras.has(camera.name);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [controlsVisible, setControlsVisible] = useState<boolean>(true);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide preview touch selection after 4s
  useEffect(() => {
    if (!isSelected || isFullscreen) return;
    const timer = setTimeout(() => {
      setIsSelected(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [isSelected, isFullscreen]);

  const resetControlsTimer = () => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isFullscreen) {
      hideTimerRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3500);
    }
  };

  const handleContainerClick = () => {
    if (isFullscreen) {
      handleFullscreenTap();
    } else {
      setIsSelected((prev) => !prev);
    }
  };

  const handleFullscreenTap = () => {
    if (isFullscreen) {
      if (controlsVisible) {
        setControlsVisible(false);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      } else {
        resetControlsTimer();
      }
    }
  };

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

  // Lock body scroll when fullscreen is active
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('fullscreen-active');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('fullscreen-active');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('fullscreen-active');
    };
  }, [isFullscreen]);

  // Escuchar cambios de fullscreen nativo
  useEffect(() => {
    const onFullscreenChange = () => {
      const isCurrent = Boolean(
        document.fullscreenElement === containerRef.current ||
        (document as any).webkitFullscreenElement === containerRef.current ||
        (document as any).webkitCurrentFullScreenElement === containerRef.current
      );
      if (!isCurrent && document.fullscreenElement === null) {
        setIsFullscreen(false);
      }
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
      try {
        (document as any).webkitExitFullscreen();
      } catch {}
    }
    setIsFullscreen(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (isFullscreen || document.fullscreenElement || (document as any).webkitFullscreenElement) {
      exitFullscreenMode();
      return;
    }

    // En móviles o pantallas táctiles, usar exclusivamente el fullscreen de la webapp (CSS en capa fija con safe-area)
    // para evitar que el reproductor nativo del sistema operativo (QuickTime/Android) salte y choque con los controles.
    const isMobileDevice = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 868;

    if (isMobileDevice) {
      setIsFullscreen(true);
      return;
    }

    // En escritorio, intentar fullscreen nativo de contenedor para ocultar barras del navegador
    if (container.requestFullscreen) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(() => {
        setIsFullscreen(true);
      });
    } else if ((container as any).webkitRequestFullscreen) {
      try {
        (container as any).webkitRequestFullscreen();
        setIsFullscreen(true);
      } catch {
        setIsFullscreen(true);
      }
    } else {
      setIsFullscreen(true);
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
      link.download = `CCTV_SNAPSHOT_${camera.name}_${new Date().toISOString().replace(/[:.]/g, '-')}.jpg`;
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      link.click();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`glass-panel telescreen-player-container ${isFullscreen ? 'player-fullscreen' : ''} ${hasActiveAlarm ? 'alarm-active' : ''}`}
      onClick={handleContainerClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
        toggleFullscreen();
      }}
      onMouseMove={resetControlsTimer}
      style={{
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: isFullscreen ? '0' : '8px',
        border: isFullscreen ? 'none' : '1px solid var(--border-party)',
        background: '#000',
        boxShadow: isFullscreen ? 'none' : '0 8px 30px rgba(0, 0, 0, 0.65)',
        transition: 'all 0.2s ease',
        width: '100%',
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
      {/* ================= FULLSCREEN TOP BAR ================= */}
      {isFullscreen && (
        <div className={`fullscreen-top-bar ${!controlsVisible ? 'fullscreen-controls-hidden' : ''}`} onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {/* Live indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '4px',
              background: isPlaying ? 'rgba(16, 185, 129, 0.25)' : 'rgba(245, 158, 11, 0.25)',
              border: `1px solid ${isPlaying ? 'rgba(16, 185, 129, 0.6)' : 'rgba(245, 158, 11, 0.6)'}`,
              fontSize: '0.72rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: isPlaying ? '#34d399' : 'var(--accent-amber)',
              whiteSpace: 'nowrap',
            }}>
              <span className={isPlaying ? 'pulse-red' : ''} style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isPlaying ? '#10b981' : '#f59e0b',
                flexShrink: 0
              }} />
              <span>{isPlaying ? t.videoPlayer.liveShort : t.videoPlayer.standby}</span>
            </div>

            {/* Camera Name */}
            <div style={{
              fontWeight: 900,
              fontSize: '1rem',
              color: '#fff',
              fontFamily: 'var(--font-display)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {camera.name}
            </div>

            {/* Mode & Quality Badges */}
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '4px',
              background: 'rgba(56, 189, 248, 0.2)',
              color: 'var(--accent-cyan)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              whiteSpace: 'nowrap'
            }}>
              {camera.connectionMode === 'pull' ? 'IP PULL' : camera.connectionMode === 'push' ? 'PUSH' : camera.sourceType?.toUpperCase() || 'LOCAL'}
            </span>

            <span className="cam-info-extended" style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              padding: '3px 8px',
              background: 'rgba(0, 0, 0, 0.6)',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              whiteSpace: 'nowrap'
            }}>
              {camera.resolution || '1280x720'} • {camera.fps ? `${camera.fps} FPS` : '25 FPS'}
            </span>
          </div>

          {/* Exit Fullscreen button */}
          <button
            onClick={exitFullscreenMode}
            title={t.videoPlayer.exitFullscreen}
            className="btn-danger"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              minHeight: '40px',
              flexShrink: 0,
            }}
          >
            <X size={16} />
            <span>{t.videoPlayer.exit}</span>
          </button>
        </div>
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
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <video
          ref={videoRef}
          muted
          autoPlay
          playsInline
          {...({ 'webkit-playsinline': 'true' } as any)}
          controls={false}
          onPlaying={() => { setIsPlaying(true); setHasError(false); }}
          onWaiting={() => setIsPlaying(false)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* HUD Overlay - Top Bar (SOLO EN MODO NORMAL, NO FULLSCREEN) */}
        {!isFullscreen && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 20,
            gap: '6px',
            flexWrap: 'wrap',
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
                {isPlaying ? t.videoPlayer.liveFull : (camera.status === 'online' ? t.videoPlayer.tuningFull : t.videoPlayer.standby)}
              </span>
              <span className="mobile-only">
                {isPlaying ? t.videoPlayer.liveShort : t.videoPlayer.tuningShort}
              </span>
            </div>

            {/* Tactical Motion Alarm Badge */}
            {hasActiveAlarm && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDrawerOpen(true);
                }}
                title={t.alerts.activeAlarm}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  background: 'rgba(225, 29, 72, 0.95)',
                  boxShadow: '0 0 14px rgba(225, 29, 72, 0.85)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  pointerEvents: 'auto',
                  border: '1px solid #ff335f',
                  animation: 'pulse-red 1.2s infinite',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                <AlertCircle size={11} />
                <span className="desktop-only">{t.alerts.badge}: {t.alerts.motionDetected.toUpperCase()}</span>
                <span className="mobile-only">{t.alerts.badge}</span>
              </div>
            )}

            {/* Badges de señal */}
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
        )}

        {/* Watermark sutil - Oculto en móvil */}
        {!isFullscreen && (
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
            {t.videoPlayer.sectorNode.replace('{id}', String(camera.id || 1))}
          </div>
        )}

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
                  {t.videoPlayer.noStream}
                </div>
                <div className="desktop-only" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '280px' }}>
                  {t.videoPlayer.waitingStream} <code className="mono">{streamUrl}</code>
                </div>
                <button
                  onClick={setupPlayer}
                  className="btn-ghost"
                  style={{ fontSize: '0.72rem', padding: '5px 10px', marginTop: '4px' }}
                >
                  <RefreshCw size={12} />
                  {t.videoPlayer.reconnect}
                </button>
              </>
            ) : (
              <>
                <Radio size={26} color="var(--accent-red)" className="animate-spin" />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-party)', fontFamily: 'var(--font-mono)' }}>
                  {t.videoPlayer.connecting}
                </div>
              </>
            )}
          </div>
        )}

        {/* Preview Controls: Solo botón de Pantalla Completa visible en Hover o Selección */}
        {!isFullscreen && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            title={t.videoPlayer.fullscreen}
            className={`preview-fullscreen-btn ${isSelected ? 'is-active' : ''}`}
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              zIndex: 30,
            }}
          >
            <Maximize2 size={16} color="var(--accent-red)" />
          </button>
        )}

        {/* Telemetry Modal / HUD Overlay (CUANDO SE ABRE EN FULLSCREEN) */}
        {showStats && isFullscreen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 70,
              background: 'rgba(8, 10, 16, 0.94)',
              border: '1px solid var(--border-party)',
              borderRadius: '8px',
              padding: '18px 20px',
              maxWidth: '380px',
              width: '90%',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-red)', fontWeight: 800, fontSize: '0.8rem', fontFamily: 'var(--font-display)' }}>
                <Terminal size={16} />
                <span>{t.videoPlayer.technicalTelemetry}</span>
              </div>
              <button onClick={() => setShowStats(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              <div>{t.videoPlayer.buffer}: <span style={{ color: 'var(--accent-red)' }}>{camera.buffer || '1000000'} B</span></div>
              <div>{t.videoPlayer.rotation}: <span style={{ color: 'var(--accent-amber)' }}>{camera.rotation || 0}°</span></div>
              <div>{t.videoPlayer.tune}: <span style={{ color: '#fff' }}>{camera.tune || 'zerolatency'}</span></div>
              <div>{t.videoPlayer.nodeId}: <span style={{ color: 'var(--text-party)' }}>#{camera.id}</span></div>
              <div>CODEC: <span style={{ color: 'var(--accent-cyan)' }}>{camera.codec || 'libx264'}</span></div>
              <div>PRESET: <span style={{ color: 'var(--text-secondary)' }}>{camera.preset || 'ultrafast'}</span></div>
            </div>
          </div>
        )}
      </div>

      {/* ================= FULLSCREEN BOTTOM BAR DOCK ================= */}
      {isFullscreen && (
        <div className={`fullscreen-bottom-bar ${!controlsVisible ? 'fullscreen-bottom-hidden' : ''}`} onClick={(e) => e.stopPropagation()}>
          <button onClick={captureSnapshot} className="fullscreen-btn" title={t.videoPlayer.saveSnapshot}>
            <CameraIcon size={16} color="var(--accent-red)" />
            <span>{t.videoPlayer.saveSnapshot}</span>
          </button>
          <button onClick={setupPlayer} className="fullscreen-btn" title={t.videoPlayer.restartStream}>
            <RefreshCw size={16} color="var(--accent-cyan)" className={isRetrying ? 'animate-spin' : ''} />
            <span>{t.videoPlayer.reconnect}</span>
          </button>
          <button onClick={() => setShowStats(!showStats)} className="fullscreen-btn" title={t.videoPlayer.technicalTelemetry}>
            <Terminal size={16} color={showStats ? 'var(--accent-red)' : 'var(--accent-amber)'} />
            <span>{t.videoPlayer.technicalTelemetry}</span>
          </button>
          <button onClick={exitFullscreenMode} className="fullscreen-btn" style={{ background: 'rgba(225, 29, 72, 0.2)', borderColor: 'var(--accent-red)' }} title={t.videoPlayer.exitFullscreen}>
            <Minimize2 size={16} color="#fff" />
            <span>{t.videoPlayer.exitFullscreen}</span>
          </button>
        </div>
      )}

      {/* Camera Info Footer (NORMAL MODE) */}
      {!isFullscreen && (
        <div style={{
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-subtle)',
          gap: '8px'
        }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ 
              fontWeight: 800, 
              fontSize: '0.85rem', 
              color: '#fff', 
              fontFamily: 'var(--font-display)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{camera.name.toUpperCase()}</span>
              {/* Badge contextual limpio según tipo de fuente */}
              {camera.sourceType === 'v4l2' || camera.connectionMode === 'local' ? (
                <span style={{ fontSize: '0.62rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', padding: '1px 5px', background: 'rgba(245, 158, 11, 0.12)', borderRadius: '3px', flexShrink: 0 }}>
                  {camera.device || 'USB'}
                </span>
              ) : camera.connectionMode === 'push' ? (
                <span style={{ fontSize: '0.62rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', padding: '1px 5px', background: 'rgba(0, 240, 255, 0.1)', borderRadius: '3px', flexShrink: 0 }}>
                  RTMP
                </span>
              ) : camera.sourceType === 'test' || camera.connectionMode === 'test' ? (
                <span style={{ fontSize: '0.62rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', padding: '1px 5px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '3px', flexShrink: 0 }}>
                  TEST
                </span>
              ) : null}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={setupPlayer}
              disabled={isRetrying}
              className="btn-ghost"
              style={{ padding: '6px 8px', fontSize: '0.72rem' }}
              title={t.videoPlayer.restartStream}
            >
              <RefreshCw size={13} className={isRetrying ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="btn-ghost"
              style={{ padding: '6px 8px', fontSize: '0.72rem' }}
              title={t.videoPlayer.fullscreen}
            >
              <Maximize2 size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Telemetry drawer (NORMAL MODE) */}
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
          <div>{t.videoPlayer.buffer}: <span style={{ color: 'var(--accent-red)' }}>{camera.buffer || '1000000'} BYTES</span></div>
          <div>{t.videoPlayer.rotation}: <span style={{ color: 'var(--accent-amber)' }}>{camera.rotation || 0}°</span></div>
          <div>{t.videoPlayer.tune}: <span style={{ color: 'var(--text-primary)' }}>{camera.tune || 'zerolatency'}</span></div>
          <div>{t.videoPlayer.nodeId}: <span style={{ color: 'var(--text-party)' }}>#CCTV-{camera.id}</span></div>
        </div>
      )}
    </div>
  );
};
