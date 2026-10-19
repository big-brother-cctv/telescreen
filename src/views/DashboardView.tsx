import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { Camera } from '../types';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { VideoPlayer } from '../components/VideoPlayer';
import {
  Radio,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCheck,
  Maximize2,
  Clock,
  ArrowRight,
  Activity,
  Layers,
  Camera as CameraIcon,
  Server,
  RefreshCw,
  Plus,
  Database,
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
    ackAllAlerts,
    setPreviewImage,
  } = useAlerts();

  // Active stream playback tracker (fed by VideoPlayer real-time playback & direct HLS probe)
  const [liveStreams, setLiveStreams] = useState<Set<string>>(new Set());

  const handleStreamStatus = useCallback((camName: string, isLive: boolean) => {
    if (!camName) return;
    const key = camName.toLowerCase().trim();
    setLiveStreams((prev) => {
      const next = new Set(prev);
      if (isLive) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  // Probe direct MediaMTX HLS stream endpoints on mount or cameras change
  useEffect(() => {
    if (!cameras || cameras.length === 0) return;
    cameras.forEach((cam) => {
      if (!cam.name) return;
      const key = cam.name.toLowerCase().trim();
      fetch(`/stream/${encodeURIComponent(cam.name)}/index.m3u8`, { method: 'HEAD', cache: 'no-store' })
        .then((res) => {
          if (res.ok) {
            setLiveStreams((prev) => new Set(prev).add(key));
          }
        })
        .catch(() => {});
    });
  }, [cameras]);

  const isCameraOnline = (c: Camera) => {
    const statusLower = (c.status || '').toLowerCase().trim();
    const nameKey = (c.name || '').toLowerCase().trim();
    return statusLower === 'online' || liveStreams.has(nameKey);
  };

  const onlineCount = cameras.filter(isCameraOnline).length;
  const standbyCount = Math.max(0, cameras.length - onlineCount);

  // Sectores en alarma activa (combinando eventos SSE en tiempo real y alertas no leídas recientes)
  const activeAlarmSectors = useMemo(() => {
    const sectors = new Set<string>(activeAlertCameras);
    const recentCutoff = Date.now() - 3 * 60 * 1000; // últimos 3 minutos
    alerts.forEach((a) => {
      if (!a.acknowledged && new Date(a.detectedAt).getTime() > recentCutoff) {
        if (a.cameraName) sectors.add(a.cameraName);
      }
    });
    return sectors;
  }, [activeAlertCameras, alerts]);

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
    <div className="responsive-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Header / Status Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid var(--border-party)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-red)', boxShadow: '0 0 10px var(--accent-red)', animation: 'pulse-fast 1.5s infinite', flexShrink: 0 }} />
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.3rem', letterSpacing: '0.04em', color: '#fff', margin: 0, textTransform: 'uppercase' }}>
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

      {/* Hero Metric Cards Grid (Responsive 4 -> 2 -> 1) */}
      <div className="dashboard-metrics-grid">
        {/* Card 1: Cámaras */}
        <div
          onClick={() => onNavigate('grid')}
          className="dashboard-metric-card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
            cursor: 'pointer',
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
              <CameraIcon size={16} color="var(--accent-teal)" />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="metric-value" style={{ fontWeight: 900, color: '#fff', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.75rem', color: onlineCount > 0 ? '#10b981' : 'var(--text-muted)' }}>{onlineCount}</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                / {cameras.length} ONLINE
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.7rem', color: onlineCount > 0 ? '#10b981' : 'var(--accent-amber)' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: onlineCount > 0 ? '#10b981' : 'var(--accent-amber)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {cameras.length === 0
                  ? t.dashboardView.noCamerasConnected
                  : t.dashboardView.liveAndStandby.replace('{online}', String(onlineCount)).replace('{standby}', String(standbyCount))}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Incidentes de Movimiento */}
        <div
          onClick={() => onNavigate('alerts')}
          className="dashboard-metric-card"
          style={{
            background: unreadCount > 0
              ? 'linear-gradient(135deg, rgba(225, 29, 72, 0.15) 0%, rgba(13, 16, 24, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: `1px solid ${unreadCount > 0 ? 'var(--accent-red)' : 'var(--border-party)'}`,
            cursor: 'pointer',
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
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 900, color: unreadCount > 0 ? 'var(--accent-red)' : '#fff', fontFamily: 'var(--font-display)' }}>
              {unreadCount} <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t.dashboardView.pending}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.dashboardView.totalHistory.replace('{count}', String(alerts.length))}
            </div>
          </div>
        </div>

        {/* Card 3: Sectores en Alarma Activa */}
        <div
          className="dashboard-metric-card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 700, textTransform: 'uppercase' }}>
              {t.dashboardView.activeAlarms}
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: activeAlarmSectors.size > 0 ? 'rgba(225, 29, 72, 0.2)' : 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color={activeAlarmSectors.size > 0 ? 'var(--accent-red)' : 'var(--accent-amber)'} />
            </div>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 900, color: activeAlarmSectors.size > 0 ? 'var(--accent-red)' : '#fff', fontFamily: 'var(--font-display)' }}>
              {activeAlarmSectors.size} <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t.dashboardView.sectors}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: activeAlarmSectors.size > 0 ? 'var(--accent-red)' : 'var(--text-secondary)', marginTop: '6px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeAlarmSectors.size > 0 ? Array.from(activeAlarmSectors).join(', ').toUpperCase() : t.dashboardView.noActiveAlarms}
            </div>
          </div>
        </div>

        {/* Card 4: Alarma Sonora y Audio Táctico */}
        <div
          className="dashboard-metric-card"
          style={{
            background: 'linear-gradient(135deg, rgba(16, 20, 30, 0.8) 0%, rgba(10, 12, 18, 0.95) 100%)',
            border: '1px solid var(--border-party)',
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
              title={soundEnabled ? t.dashboardView.soundMuteTooltip : t.dashboardView.soundUnmuteTooltip}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
          <div style={{ marginTop: '12px' }}>
            <div className="metric-value" style={{ fontSize: '1.2rem', fontWeight: 800, color: soundEnabled ? '#10b981' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              {soundEnabled ? t.dashboardView.soundActive : t.dashboardView.soundMuted}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {t.dashboardView.soundSynthesizer}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Motion Snapshots Section */}
      <div className="dashboard-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CameraIcon size={18} color="var(--accent-red)" />
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
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
          <div className="dashboard-snapshots-grid">
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
      <div className="dashboard-panel">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="var(--accent-teal)" />
            <h2 style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              {t.dashboardView.liveFeeds}
            </h2>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              ({cameras.length})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            {t.dashboardView.noCamerasConfigured}
          </div>
        ) : (
          <div className="dashboard-feeds-grid">
            {cameras.slice(0, 4).map((cam) => (
              <VideoPlayer
                key={cam.id || cam.name}
                camera={cam}
                onStreamStatusChange={handleStreamStatus}
                isThumbnail={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Network Infrastructure Telemetry Section (Responsive Tactical Panel) */}
      <div className="dashboard-panel">
        {/* Panel Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={18} color="var(--accent-teal)" />
            <div>
              <h2 style={{ fontSize: '0.92rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff', margin: 0, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                {t.dashboardView.infraTitle}
              </h2>
              <div className="desktop-only" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                {t.dashboardView.infraSubtitle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#10b981' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', animation: 'pulse-fast 1.5s infinite' }} />
            <span style={{ fontWeight: 800 }}>{t.dashboardView.infraAllOnline}</span>
          </div>
        </div>

        {/* 4 Infrastructure Service Nodes */}
        <div className="dashboard-infra-grid">
          {/* Node 1: MediaMTX */}
          <div className="dashboard-infra-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(0, 240, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Radio size={15} color="var(--accent-teal)" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.dashboardView.infraMediaMtx}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    RTSP :8554 • HLS :8888 • WHEP :8889
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>UDP :8189 (ICE) • API :9997</span>
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>LAT: &lt;0.2s</span>
            </div>
          </div>

          {/* Node 2: API Core */}
          <div className="dashboard-infra-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Server size={15} color="var(--accent-cyan)" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.dashboardView.infraApi}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--accent-teal)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    REST :8080 • Go 1.22 Runtime
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>SSE :8080 • /healthz OK</span>
              <span style={{ color: '#10b981', flexShrink: 0 }}>UPTIME: 99.9%</span>
            </div>
          </div>

          {/* Node 3: Motion Detector Daemon */}
          <div className="dashboard-infra-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Activity size={15} color="var(--accent-amber)" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.dashboardView.infraMotion}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Motion Daemon :8083 • Ingest RTSP
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {t.dashboardView.infraActive}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Diff Threshold: 1500px • Rate: 30fps</span>
              <span style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>PIPELINE OK</span>
            </div>
          </div>

          {/* Node 4: PostgreSQL Database */}
          <div className="dashboard-infra-card">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(192, 132, 252, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Database size={15} color="#c084fc" />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.dashboardView.infraDb}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: '#c084fc', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Port :5432 • Max Conn: 100
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, padding: '2px 6px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.4)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                {t.dashboardView.infraConnected}
              </span>
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>PVC 10Gi (local-path) • Bound</span>
              <span style={{ color: '#10b981', flexShrink: 0 }}>PERSISTENT</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
