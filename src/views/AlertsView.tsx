import React, { useState, useMemo } from 'react';
import type { Camera } from '../types';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAiLabelInfo } from '../utils/aiLabel';
import {
  ShieldAlert,
  Clock,
  Check,
  Trash2,
  Maximize2,
  Download,
  Filter,
  CheckCheck,
  Grid,
  List,
  RefreshCw,
  Search,
  Calendar,
  AlertTriangle,
  Bell,
  BellOff
} from 'lucide-react';

interface AlertsViewProps {
  cameras: Camera[];
}

export const AlertsView: React.FC<AlertsViewProps> = ({ cameras }) => {
  const { t, language } = useLanguage();
  const {
    alerts,
    unreadCount,
    ackAlert,
    ackAllAlerts,
    deleteAlert,
    clearAllAlerts,
    refreshAlerts,
    totalAlerts,
    hasMore,
    loadMoreAlerts,
    isLoadingMore,
    setPreviewImage,
    browserNotificationsEnabled,
    notificationPermission,
    requestNotificationPermission,
  } = useAlerts();

  const [selectedCamera, setSelectedCamera] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [viewMode, setViewMode] = useState<'gallery' | 'table'>('gallery');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAlerts();
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const getTimeAgo = (isoString: string) => {
    try {
      const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSec < 60) return t.alerts.justNow;
      const mins = Math.floor(diffSec / 60);
      if (mins < 60) return t.alerts.minutesAgo.replace('{m}', String(mins));
      const hours = Math.floor(mins / 60);
      return t.alertsTab.hoursAgo.replace('{h}', String(hours));
    } catch {
      return '';
    }
  };

  // Filtrado reactivo de alertas
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Filtro de cámara
      if (selectedCamera !== 'all' && alert.cameraName !== selectedCamera) {
        return false;
      }
      // Filtro de estado
      if (statusFilter === 'unread' && alert.acknowledged) {
        return false;
      }
      if (statusFilter === 'read' && !alert.acknowledged) {
        return false;
      }
      // Búsqueda por texto libre
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCam = alert.cameraName.toLowerCase().includes(query);
        const matchesLabel = (alert.label || '').toLowerCase().includes(query);
        if (!matchesCam && !matchesLabel) return false;
      }
      return true;
    });
  }, [alerts, selectedCamera, statusFilter, searchQuery]);

  return (
    <div className="responsive-container" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* View Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          borderBottom: '1px solid var(--border-party)',
          paddingBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(225, 29, 72, 0.2)',
              border: '1px solid var(--accent-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(225, 29, 72, 0.3)',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={20} color="var(--accent-red)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  letterSpacing: '0.04em',
                  color: '#fff',
                  margin: 0,
                  textTransform: 'uppercase',
                }}
              >
                {t.alertsTab.title}
              </h1>
              {unreadCount > 0 && (
                <span
                  style={{
                    background: 'var(--accent-red)',
                    color: '#fff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    boxShadow: '0 0 10px var(--accent-red)',
                  }}
                >
                  {unreadCount} {t.dashboardView.pending}
                </span>
              )}
            </div>
            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: '0.76rem',
                margin: '4px 0 0 0',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {t.alertsTab.subtitle}
            </p>
          </div>
        </div>

        {/* Global Action Toolbar */}
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
            title={t.alerts.markAllRead}
          >
            <CheckCheck size={14} color={unreadCount > 0 ? 'var(--accent-teal)' : 'var(--text-muted)'} />
            <span>{t.alerts.markAllRead}</span>
          </button>

          <button
            onClick={clearAllAlerts}
            disabled={alerts.length === 0}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              gap: '6px',
              color: 'var(--accent-red)',
              opacity: alerts.length > 0 ? 1 : 0.5,
              cursor: alerts.length > 0 ? 'pointer' : 'default',
            }}
            title={t.alerts.clearHistory}
          >
            <Trash2 size={13} />
            <span className="desktop-only">{t.alerts.clearHistory}</span>
          </button>

          <button
            onClick={handleRefresh}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', gap: '6px' }}
            title={t.common.refresh}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          </button>

          <button
            onClick={() => {
              if (notificationPermission !== 'granted') {
                requestNotificationPermission();
              }
            }}
            className="btn-ghost"
            style={{
              fontSize: '0.75rem',
              gap: '6px',
              background: browserNotificationsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              borderColor: browserNotificationsEnabled ? '#10b981' : 'var(--border-subtle)',
              color: browserNotificationsEnabled ? '#10b981' : 'var(--text-secondary)',
            }}
            title={browserNotificationsEnabled ? t.alerts.notificationsTooltipActive : t.alerts.notificationsTooltipEnable}
          >
            {browserNotificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            <span>{browserNotificationsEnabled ? t.alerts.notificationsBtnActive : t.alerts.notificationsBtnEnable}</span>
          </button>
        </div>
      </div>

      {/* Push Notification Guide Banner if permission not granted */}
      {notificationPermission !== 'granted' && (() => {
        const isMobile = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
        const isDenied = notificationPermission === 'denied';
        return (
          <div
            style={{
              margin: '0 0 16px 0',
              padding: '12px 16px',
              borderRadius: '8px',
              background: isDenied
                ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
                : 'linear-gradient(90deg, rgba(225, 29, 72, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
              border: `1px solid ${isDenied ? 'rgba(239, 68, 68, 0.4)' : 'rgba(225, 29, 72, 0.3)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} color={isDenied ? 'var(--accent-red)' : 'var(--accent-amber)'} style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#fff' }}>
                  {isDenied
                    ? t.alerts.notificationsDenied
                    : isMobile
                    ? t.alerts.bannerMobileTitle
                    : t.alerts.bannerPcTitle}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {isDenied
                    ? t.alerts.notificationsBlockedHelp
                    : isMobile
                    ? t.alerts.bannerMobileDesc
                    : t.alerts.bannerPcDesc}
                </div>
              </div>
            </div>
            {!isDenied && (
              <button
                onClick={() => requestNotificationPermission()}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  background: 'var(--accent-red)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 0 12px rgba(225, 29, 72, 0.5)',
                }}
              >
                {isMobile ? t.alerts.activateMobileBtn : t.alerts.activatePcBtn}
              </button>
            )}
          </div>
        );
      })()}

      {/* Filter and View Mode Control Bar */}
      <div className="alerts-filter-bar">
        {/* Left: Filter Controls */}
        <div className="alerts-filter-group">
          {/* Camera Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                padding: '6px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              <option value="all" style={{ background: '#0b0d13' }}>
                {t.alertsTab.allCameras}
              </option>
              {cameras.map((c) => (
                <option key={c.id} value={c.name} style={{ background: '#0b0d13' }}>
                  {c.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Buttons */}
          <div className="status-pill-group" style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setStatusFilter('all')}
              style={{
                background: statusFilter === 'all' ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                border: 'none',
                color: statusFilter === 'all' ? '#fff' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {t.alertsTab.filterAll}
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              style={{
                background: statusFilter === 'unread' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                border: 'none',
                color: statusFilter === 'unread' ? 'var(--accent-red)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {t.alertsTab.filterUnread}
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              style={{
                background: statusFilter === 'read' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                border: 'none',
                color: statusFilter === 'read' ? 'var(--accent-teal)' : 'var(--text-muted)',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {t.alertsTab.filterRead}
            </button>
          </div>

          {/* Search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '8px' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.alertsTab.searchPlaceholder}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: '#fff',
                fontSize: '0.75rem',
                fontFamily: 'var(--font-mono)',
                padding: '6px 10px 6px 26px',
                borderRadius: '4px',
                width: '180px',
              }}
            />
          </div>
        </div>

        {/* Right: Layout Switcher (Gallery vs Table) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {t.alertsTab.showingCount.replace('{filtered}', String(filteredAlerts.length)).replace('{total}', String(alerts.length))}
          </span>
          <div style={{ display: 'flex', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', padding: '2px', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('gallery')}
              title={t.alertsTab.galleryMode}
              style={{
                background: viewMode === 'gallery' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'gallery' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
              }}
            >
              <Grid size={14} />
              <span className="desktop-only">{t.alertsTab.galleryMode}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              title={t.alertsTab.tableMode}
              style={{
                background: viewMode === 'table' ? 'rgba(225, 29, 72, 0.25)' : 'transparent',
                border: 'none',
                color: viewMode === 'table' ? '#fff' : 'var(--text-muted)',
                padding: '4px 8px',
                borderRadius: '3px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.7rem',
              }}
            >
              <List size={14} />
              <span className="desktop-only">{t.alertsTab.tableMode}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Area: Gallery or Table */}
      {filteredAlerts.length === 0 ? (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'rgba(13, 16, 24, 0.5)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldAlert size={28} color="var(--text-muted)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff' }}>
            {t.alertsTab.emptyTitle}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxWidth: '420px' }}>
            {t.alertsTab.emptyDesc}
          </div>
        </div>
      ) : viewMode === 'gallery' ? (
        /* Large Photo Gallery Mode */
        <div className="alerts-gallery-grid">
          {filteredAlerts.map((alert) => {
            const snapshotUrl = alert.snapshotPath
              ? `/api/alerts/snapshots/${alert.snapshotPath.split('/').pop()}`
              : '';

            return (
              <div
                key={alert.id}
                style={{
                  background: alert.acknowledged
                    ? 'rgba(14, 17, 26, 0.75)'
                    : 'linear-gradient(135deg, rgba(225, 29, 72, 0.12) 0%, rgba(18, 22, 34, 0.9) 100%)',
                  border: `1px solid ${
                    alert.acknowledged ? 'var(--border-subtle)' : 'rgba(225, 29, 72, 0.65)'
                  }`,
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: alert.acknowledged
                    ? 'none'
                    : '0 6px 24px rgba(225, 29, 72, 0.18)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Photo Viewer Container */}
                <div
                  onClick={() =>
                    snapshotUrl &&
                    setPreviewImage({
                      url: snapshotUrl,
                      title: alert.cameraName.toUpperCase(),
                      time: `${formatDate(alert.detectedAt)} ${formatTime(alert.detectedAt)}`,
                    })
                  }
                  style={{
                    height: '200px',
                    background: '#05070a',
                    position: 'relative',
                    cursor: snapshotUrl ? 'pointer' : 'default',
                    overflow: 'hidden',
                  }}
                  title={snapshotUrl ? t.alertsTab.zoomSnapshot : ''}
                >
                  {snapshotUrl ? (
                    <>
                      <img
                        src={snapshotUrl}
                        alt="Motion Snapshot"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          const target = e.target as HTMLElement;
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.snapshot-fallback');
                          if (fallback) (fallback as HTMLElement).style.display = 'flex';
                        }}
                      />
                      <div
                        className="snapshot-fallback"
                        style={{
                          display: 'none',
                          height: '100%',
                          width: '100%',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: 'var(--text-muted)',
                          background: 'rgba(0,0,0,0.85)',
                        }}
                      >
                        <AlertTriangle size={24} color="var(--accent-red)" />
                        <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>{t.alertsTab.noPhoto}</span>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: 0,
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                      >
                        <Maximize2 size={24} color="#fff" />
                      </div>
                    </>
                  ) : (
                    <div
                      style={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <AlertTriangle size={28} color="var(--accent-red)" />
                      <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>{t.alertsTab.noPhoto}</span>
                    </div>
                  )}

                  {/* Status Overlay Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: alert.acknowledged ? 'rgba(0, 240, 255, 0.9)' : 'rgba(225, 29, 72, 0.95)',
                      color: alert.acknowledged ? '#000' : '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      letterSpacing: '0.04em',
                      boxShadow: alert.acknowledged ? 'none' : '0 0 10px rgba(225, 29, 72, 0.6)',
                    }}
                  >
                    {alert.acknowledged ? t.alerts.acked.toUpperCase() : t.alerts.badge}
                  </div>

                  {/* Cartel con lo que la IA estima que es el objeto detectado */}
                  {(() => {
                    const aiInfo = getAiLabelInfo(alert.label, language);
                    return (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: 'rgba(10, 13, 20, 0.88)',
                          backdropFilter: 'blur(6px)',
                          color: aiInfo.isAi ? 'var(--accent-party)' : 'var(--text-secondary)',
                          fontSize: '0.64rem',
                          fontWeight: 800,
                          fontFamily: 'var(--font-mono)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          border: `1px solid ${aiInfo.isAi ? 'rgba(0, 240, 255, 0.45)' : 'rgba(255, 255, 255, 0.15)'}`,
                          letterSpacing: '0.04em',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.6)',
                        }}
                      >
                        <span>{aiInfo.icon}</span>
                        <span>{aiInfo.text}</span>
                      </div>
                    );
                  })()}
                </div>

                {/* Card Info & Actions */}
                <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 900,
                        fontSize: '0.9rem',
                        color: '#fff',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {alert.cameraName.toUpperCase()}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Clock size={12} />
                      <span>{formatTime(alert.detectedAt)}</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.7rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} color="var(--text-muted)" />
                      <span>{formatDate(alert.detectedAt)}</span>
                    </div>
                    <span>{getTimeAgo(alert.detectedAt)}</span>
                  </div>

                  {/* Card Bottom Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                      paddingTop: '10px',
                      marginTop: '4px',
                    }}
                  >
                    {!alert.acknowledged ? (
                      <button
                        onClick={() => ackAlert(alert.id)}
                        style={{
                          background: 'rgba(225, 29, 72, 0.2)',
                          border: '1px solid var(--accent-red)',
                          color: '#fff',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <Check size={13} />
                        <span>{t.alerts.ack}</span>
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--accent-teal)',
                          fontSize: '0.72rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        <Check size={13} />
                        <span>{t.alerts.acked}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {snapshotUrl && (
                        <a
                          href={snapshotUrl}
                          download={`snapshot_${alert.cameraName}_${alert.id}.jpg`}
                          style={{
                            background: 'transparent',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)',
                            borderRadius: '4px',
                            padding: '4px 6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                          title={t.alertsTab.downloadSnapshot}
                        >
                          <Download size={13} />
                        </a>
                      )}

                      <button
                        onClick={() => deleteAlert(alert.id)}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        title={t.alerts.delete}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table / List Mode */
        <div
          className="table-responsive-wrapper"
          style={{
            background: 'rgba(13, 16, 24, 0.8)',
            border: '1px solid var(--border-party)',
            borderRadius: '8px',
          }}
        >
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
            <thead>
              <tr style={{ background: 'rgba(18, 22, 34, 0.95)', borderBottom: '1px solid var(--border-party)' }}>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.alertsTab.colSnapshot}</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.alertsTab.colCamera}</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.alertsTab.colTimeDate}</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.alertsTab.colLabel}</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{t.alertsTab.colStatus}</th>
                <th style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textAlign: 'right' }}>{t.alertsTab.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => {
                const snapshotUrl = alert.snapshotPath
                  ? `/api/alerts/snapshots/${alert.snapshotPath.split('/').pop()}`
                  : '';

                return (
                  <tr
                    key={alert.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: alert.acknowledged ? 'transparent' : 'rgba(225, 29, 72, 0.05)',
                    }}
                  >
                    <td style={{ padding: '10px 16px' }}>
                      {snapshotUrl ? (
                        <div
                          onClick={() =>
                            setPreviewImage({
                              url: snapshotUrl,
                              title: alert.cameraName.toUpperCase(),
                              time: `${formatDate(alert.detectedAt)} ${formatTime(alert.detectedAt)}`,
                            })
                          }
                          style={{
                            width: '64px',
                            height: '40px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            background: '#000',
                            border: '1px solid var(--border-subtle)',
                            cursor: 'pointer',
                          }}
                        >
                          <img src={snapshotUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{t.alertsTab.noPhoto}</span>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#fff' }}>
                      {alert.cameraName.toUpperCase()}
                    </td>

                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)' }}>
                      <div>{formatTime(alert.detectedAt)}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>{formatDate(alert.detectedAt)} ({getTimeAgo(alert.detectedAt)})</div>
                    </td>

                    <td style={{ padding: '10px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-party)' }}>
                      {(() => {
                        const aiInfo = getAiLabelInfo(alert.label, language);
                        return (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span>{aiInfo.icon}</span>
                            <span>{aiInfo.text}</span>
                          </span>
                        );
                      })()}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <span
                        style={{
                          background: alert.acknowledged ? 'rgba(0, 240, 255, 0.15)' : 'rgba(225, 29, 72, 0.2)',
                          color: alert.acknowledged ? 'var(--accent-teal)' : 'var(--accent-red)',
                          border: `1px solid ${alert.acknowledged ? 'var(--accent-teal)' : 'var(--accent-red)'}`,
                          padding: '2px 6px',
                          borderRadius: '3px',
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                        }}
                      >
                        {alert.acknowledged ? t.alerts.acked : t.alerts.badge}
                      </span>
                    </td>

                    <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {!alert.acknowledged && (
                          <button
                            onClick={() => ackAlert(alert.id)}
                            style={{
                              background: 'rgba(225, 29, 72, 0.15)',
                              border: '1px solid var(--accent-red)',
                              color: '#fff',
                              borderRadius: '4px',
                              padding: '4px 8px',
                              fontSize: '0.7rem',
                              cursor: 'pointer',
                            }}
                          >
                            {t.alerts.ack}
                          </button>
                        )}
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px',
                          }}
                          title={t.alerts.delete}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Load More Button */}
      {hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
          <button
            type="button"
            onClick={loadMoreAlerts}
            disabled={isLoadingMore}
            className="btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              border: '1px solid var(--border-party)',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent-teal)',
              background: 'rgba(0, 240, 255, 0.05)',
              cursor: isLoadingMore ? 'wait' : 'pointer',
            }}
          >
            <RefreshCw size={15} style={{ animation: isLoadingMore ? 'spin 1s linear infinite' : 'none' }} />
            <span>{isLoadingMore ? t.common.saving : `${t.alertsTab.loadMore} (${alerts.length} / ${totalAlerts})`}</span>
          </button>
        </div>
      )}
    </div>
  );
};
