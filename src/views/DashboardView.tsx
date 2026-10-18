import React from 'react';
import type { Camera } from '../types';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  Zap,
  CheckCheck,
  Maximize2,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Camera as CameraIcon,
  Server,
  RefreshCw,
  Plus
} from 'lucide-react';

interface DashboardViewProps {
  cameras: Camera[];
  isLoading: boolean;
  onRefresh: () => void;
  onNavigate: (view: 'dashboard' | 'grid' | 'alerts' | 'admin' | 'users') => void;
  onAddCamera: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cameras,
  isLoading,
  onRefresh,
  onNavigate,
  onAddCamera,
}) => {
  const { t } = useLanguage();
  const {
    alerts,
    unreadCount,
    activeAlertCameras,
    soundEnabled,
    setSoundEnabled,
    triggerTestAlert,
    ackAllAlerts,
    setPreviewImage,
  } = useAlerts();

  const onlineCamerasCount = cameras.filter((c) => c.status === 'online').length;
  const recentAlertsWithPhotos = alerts.filter((a) => a.snapshotPath).slice(0, 6);

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return isoString;
    }
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return t.alerts.justNow;
      const mins = Math.floor(diffSec / 60);
      return t.alerts.minutesAgo.replace('{m}', String(mins));
    } catch {
      return '';
    }
  };

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1600px', margin: '0 auto', width: '100%' }}>
      {/* Top Header / Status Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border-party)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 10px var(--accent-red)', animation: 'pulse-fast 1.5s infinite' }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.04em', color: '#fff', margin: 0, textTransform: 'uppercase' }}>
              {t.dashboardView.title}
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '4px 0 0 20px', fontFamily: 'var(--font-mono)' }}>
            {t.dashboardView.subtitle}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => triggerTestAlert()}
            className="btn-ghost"
            style={{
              background: 'rgba(225, 29, 72, 0.15)',
              borderColor: 'var(--accent-red)',
              color: '#fff',
              fontSize: '0.75rem',
              gap: '6px',
            }}
            title={t.dashboardView.testAlert}
          >
            <Zap size={14} color="var(--accent-red)" />
            <span>{t.dashboardView.testAlert}</span>
          </button>

          <button
            onClick={ackAllAlerts}
            disabled={unreadCount === 0}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              gap: '6px',
              opacity: unreadCount > 0 ? 1 : 0.5,
              cursor: unreadCount > 0 ? 'pointer' : 'default',
            }}
          >
            <CheckCheck size={14} color={unreadCount > 0 ? 'var(--accent-teal)' : 'var(--text-muted)'} />
            <span>{t.dashboardView.markAllSeen}</span>
          </button>

          <button
            onClick={onRefresh}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', gap: '6px' }}
            title={t.common.refresh}
          >
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
            <span className="desktop-only">{t.common.refresh}</span>
          </button>
        </div>
      </div>

      {/* Hero Metric Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}
      >
        {/* Card 1: Cámaras */}
        <div
          onClick={() => onNavigate('grid')}
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
            borderRadius: '8px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-teal)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-party)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.dashboardView.totalCameras}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={16} color="var(--accent-teal)" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)' }}>
              {onlineCamerasCount} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ {cameras.length} ONLINE</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.7rem', color: onlineCamerasCount > 0 ? '#10b981' : 'var(--accent-amber)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: onlineCamerasCount > 0 ? '#10b981' : 'var(--accent-amber)' }} />
              <span>{onlineCamerasCount > 0 ? `${onlineCamerasCount} transmisiones RTSP/HLS activas` : 'Sin cámaras conectadas'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Incidentes de Movimiento */}
        <div
          onClick={() => onNavigate('alerts')}
          style={{
            background: unreadCount > 0
              ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(13, 16, 24, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: `1px solid ${unreadCount > 0 ? 'var(--accent-red)' : 'var(--border-party)'}`,
            borderRadius: '8px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: unreadCount > 0 ? '0 4px 20px rgba(225, 29, 72, 0.2)' : 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-red)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = unreadCount > 0 ? 'var(--accent-red)' : 'var(--border-party)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.dashboardView.unreadAlerts}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(225, 29, 72, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={16} color="var(--accent-red)" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: unreadCount > 0 ? 'var(--accent-red)' : '#fff', fontFamily: 'var(--font-display)' }}>
              {unreadCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>PENDIENTES</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              Total histórico: {alerts.length} incidentes
            </div>
          </div>
        </div>

        {/* Card 3: Sectores en Alarma Activa */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.dashboardView.activeAlarms}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="var(--accent-party)" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: activeAlertCameras.size > 0 ? 'var(--accent-red)' : '#fff', fontFamily: 'var(--font-display)' }}>
              {activeAlertCameras.size} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>SECTORES</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: activeAlertCameras.size > 0 ? 'var(--accent-red)' : 'var(--text-secondary)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              {activeAlertCameras.size > 0 ? Array.from(activeAlertCameras).join(', ').toUpperCase() : 'Ninguna alarma activa en curso'}
            </div>
          </div>
        </div>

        {/* Card 4: Alarma Sonora y Audio Táctico */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
            borderRadius: '8px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.alerts.soundAlerts}
            </span>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: soundEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${soundEnabled ? '#10b981' : 'var(--border-subtle)'}`,
                color: soundEnabled ? '#10b981' : 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={soundEnabled ? 'Silenciar alarma' : 'Activar alarma acústica'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: soundEnabled ? '#10b981' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {soundEnabled ? 'ACTIVA (CHIRP)' : 'SILENCIADA'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
              Sintetizador Web Audio API local
            </div>
          </div>
        </div>
      </div>

      {/* Recent Motion Snapshots Section */}
      <div style={{ background: 'rgba(13, 16, 24, 0.8)', border: '1px solid var(--border-party)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CameraIcon size={18} color="var(--accent-red)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {t.dashboardView.recentSnapshots}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({recentAlertsWithPhotos.length})
            </span>
          </div>

          <button
            onClick={() => onNavigate('alerts')}
            className="btn-ghost"
            style={{ fontSize: '0.74rem', gap: '6px', color: 'var(--accent-teal)' }}
          >
            <span>{t.dashboardView.viewAllAlerts}</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentAlertsWithPhotos.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            {t.dashboardView.noSnapshots}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '14px',
            }}
          >
            {recentAlertsWithPhotos.map((alert) => {
              const snapshotUrl = alert.snapshotPath
                ? `/api/alerts/snapshots/${alert.snapshotPath.split('/').pop()}`
                : '';

              return (
                <div
                  key={alert.id}
                  style={{
                    background: 'rgba(18, 22, 34, 0.7)',
                    border: `1px solid ${alert.acknowledged ? 'var(--border-subtle)' : 'rgba(225, 29, 72, 0.6)'}`,
                    borderRadius: '6px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
                >
                  {/* Photo Container */}
                  <div
                    onClick={() =>
                      snapshotUrl &&
                      setPreviewImage({
                        url: snapshotUrl,
                        title: alert.cameraName.toUpperCase(),
                        time: formatTime(alert.detectedAt),
                      })
                    }
                    style={{
                      height: '140px',
                      background: '#000',
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={snapshotUrl}
                      alt="Snapshot"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0, 0, 0, 0.35)',
                        opacity: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'opacity 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                    >
                      <Maximize2 size={20} color="#fff" />
                    </div>

                    {/* Status Badge */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        left: '8px',
                        background: alert.acknowledged ? 'rgba(0, 240, 255, 0.85)' : 'rgba(225, 29, 72, 0.85)',
                        color: '#fff',
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        letterSpacing: '0.04em',
                      }}
                    >
                      {alert.acknowledged ? t.alerts.acked.toUpperCase() : t.alerts.badge}
                    </div>
                  </div>

                  {/* Details Footer */}
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff' }}>
                        {alert.cameraName.toUpperCase()}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        <Clock size={11} />
                        <span>{formatTime(alert.detectedAt)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {getTimeAgo(alert.detectedAt)} • {alert.label?.toUpperCase() || 'MOTION'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Live Cameras Mini-Grid Preview */}
      <div style={{ background: 'rgba(13, 16, 24, 0.8)', border: '1px solid var(--border-party)', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-teal)" />
            <h2 style={{ fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {t.dashboardView.liveFeeds}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({cameras.length})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={onAddCamera}
              className="btn-ghost"
              style={{ fontSize: '0.74rem', gap: '5px' }}
            >
              <Plus size={14} />
              <span>{t.navbar.cameras}</span>
            </button>
            <button
              onClick={() => onNavigate('grid')}
              className="btn-ghost"
              style={{ fontSize: '0.74rem', gap: '6px', color: 'var(--accent-teal)' }}
            >
              <span>{t.dashboardView.viewLiveGrid}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {cameras.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
            No hay cámaras configuradas en el sistema.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '16px',
            }}
          >
            {cameras.slice(0, 4).map((cam) => (
              <div
                key={cam.id}
                style={{
                  border: activeAlertCameras.has(cam.name)
                    ? '2px solid var(--accent-red)'
                    : '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: activeAlertCameras.has(cam.name)
                    ? '0 0 15px rgba(225, 29, 72, 0.4)'
                    : 'none',
                }}
              >
                <VideoPlayer camera={cam} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Network Infrastructure Telemetry Footer */}
      <div
        style={{
          background: 'rgba(9, 11, 16, 0.6)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '6px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '0.72rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Server size={14} color="var(--accent-teal)" />
          <span>INFRAESTRUCTURA:</span>
          <span style={{ color: '#fff' }}>MediaMTX (RTSP:8554 / HLS:8888)</span>
          <span>•</span>
          <span style={{ color: '#fff' }}>API Core Go (:8080)</span>
          <span>•</span>
          <span style={{ color: '#fff' }}>Motion Detector (Daemon)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
          <span>{t.dashboardView.operational}</span>
        </div>
      </div>
    </div>
  );
};
