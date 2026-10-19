import React from 'react';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  X,
  Check,
  Radio,
  Clock,
  Maximize2,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export const AlertsDrawer: React.FC = () => {
  const { t } = useLanguage();
  const {
    alerts,
    unreadCount,
    isDrawerOpen,
    setIsDrawerOpen,
    soundEnabled,
    setSoundEnabled,
    browserNotificationsEnabled,
    notificationPermission,
    requestNotificationPermission,
    ackAlert,
    ackAllAlerts,
    deleteAlert,
    clearAllAlerts,
    setPreviewImage,
  } = useAlerts();

  if (!isDrawerOpen) return null;

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
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsDrawerOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
        }}
      />

      {/* Drawer Container */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(11, 13, 19, 0.98)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid var(--border-party)',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.85)',
          zIndex: 999,
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
            paddingLeft: 'max(20px, env(safe-area-inset-left, 0px))',
            paddingRight: 'max(20px, env(safe-area-inset-right, 0px))',
            borderBottom: '1px solid var(--border-party)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(180deg, rgba(225, 29, 72, 0.12) 0%, rgba(11, 13, 19, 0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                background: 'rgba(225, 29, 72, 0.2)',
                border: '1px solid var(--accent-red)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AlertTriangle size={18} color="var(--accent-red)" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  letterSpacing: '0.04em',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {t.alerts.title.toUpperCase()}
                {unreadCount > 0 && (
                  <span
                    style={{
                      background: 'var(--accent-red)',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      padding: '1px 6px',
                      borderRadius: '10px',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {t.alerts.drawerSubtitle}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? t.alerts.soundAlerts : `${t.alerts.soundAlerts} (Muted)`}
              style={{
                background: soundEnabled ? 'rgba(225, 29, 72, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${soundEnabled ? 'var(--accent-red)' : 'var(--border-subtle)'}`,
                color: soundEnabled ? 'var(--accent-red)' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Native Browser Notification Toggle */}
            <button
              onClick={() => {
                if (notificationPermission !== 'granted') {
                  requestNotificationPermission();
                }
              }}
              title={
                browserNotificationsEnabled
                  ? t.alerts.notificationsEnabled
                  : notificationPermission === 'denied'
                  ? t.alerts.notificationsDenied
                  : t.alerts.enableNotifications
              }
              style={{
                background: browserNotificationsEnabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${browserNotificationsEnabled ? '#10b981' : 'var(--border-subtle)'}`,
                color: browserNotificationsEnabled ? '#10b981' : 'var(--text-muted)',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {browserNotificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            </button>

            {/* Close Drawer Button */}
            <button
              onClick={() => setIsDrawerOpen(false)}
              aria-label={t.alerts.closeDrawerAria}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Notification Activation Banner */}
        {notificationPermission !== 'granted' && (() => {
          const isMobile = typeof window !== 'undefined' && (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768);
          const isDenied = notificationPermission === 'denied';
          return (
            <div
              style={{
                padding: '12px 16px',
                background: isDenied
                  ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
                  : 'linear-gradient(90deg, rgba(225, 29, 72, 0.15) 0%, rgba(245, 158, 11, 0.15) 100%)',
                borderBottom: `1px solid ${isDenied ? 'rgba(239, 68, 68, 0.4)' : 'rgba(225, 29, 72, 0.3)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={18} color={isDenied ? 'var(--accent-red)' : 'var(--accent-amber)'} style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '0.75rem', color: '#fff', lineHeight: 1.3 }}>
                  <span style={{ fontWeight: 800, display: 'block' }}>
                    {isDenied
                      ? t.alerts.notificationsDenied
                      : isMobile
                      ? t.alerts.bannerMobileTitle
                      : t.alerts.bannerPcTitle}
                  </span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.68rem' }}>
                    {isDenied
                      ? t.alerts.notificationsBlockedHelp
                      : isMobile
                      ? t.alerts.bannerMobileDesc
                      : t.alerts.bannerPcDesc}
                  </span>
                </div>
              </div>
              {!isDenied && (
                <button
                  onClick={() => requestNotificationPermission()}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: 'var(--accent-red)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(225, 29, 72, 0.5)',
                  }}
                >
                  {isMobile ? t.alerts.activateMobileBtn : t.alerts.activatePcBtn}
                </button>
              )}
            </div>
          );
        })()}

        {/* Action Bar (Mark All, Clear All) */}
        {alerts.length > 0 && (
          <div
            style={{
              padding: '10px 16px',
              background: 'rgba(15, 18, 26, 0.8)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            <button
              onClick={ackAllAlerts}
              disabled={unreadCount === 0}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: unreadCount > 0 ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: unreadCount > 0 ? 'pointer' : 'default',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
                opacity: unreadCount > 0 ? 1 : 0.5,
              }}
            >
              <CheckCheck size={14} color={unreadCount > 0 ? 'var(--accent-red)' : 'var(--text-muted)'} />
              {t.alerts.markAllRead}
            </button>

            <button
              onClick={clearAllAlerts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              <Trash2 size={13} />
              {t.alerts.clearHistory}
            </button>
          </div>
        )}

        {/* Alerts List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {alerts.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-muted)',
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <ShieldCheck size={32} color="#10b981" />
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  letterSpacing: '0.06em',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}
              >
                {t.alerts.noAlerts}
              </div>
              <div style={{ fontSize: '0.75rem', maxWidth: '260px', lineHeight: 1.4 }}>
                {t.alerts.noAlertsDesc}
              </div>
            </div>
          ) : (
            alerts.map((alert) => {
              const snapshotUrl = alert.snapshotPath
                ? `/api/alerts/snapshots/${alert.snapshotPath.split('/').pop()}`
                : '';

              return (
                <div
                  key={alert.id}
                  style={{
                    background: alert.acknowledged
                      ? 'rgba(16, 19, 28, 0.75)'
                      : 'linear-gradient(135deg, rgba(225, 29, 72, 0.12) 0%, rgba(18, 22, 34, 0.85) 100%)',
                    border: `1px solid ${
                      alert.acknowledged ? 'var(--border-subtle)' : 'rgba(225, 29, 72, 0.5)'
                    }`,
                    borderRadius: '8px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    boxShadow: alert.acknowledged
                      ? 'none'
                      : '0 4px 16px rgba(225, 29, 72, 0.15)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {/* Top card row: Camera badge, Time, Ack status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: alert.acknowledged ? 'var(--text-muted)' : 'var(--accent-red)',
                          boxShadow: alert.acknowledged ? 'none' : '0 0 8px var(--accent-red)',
                        }}
                      />
                      <span
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: alert.acknowledged ? 'var(--text-secondary)' : '#fff',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {alert.cameraName.toUpperCase()}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.68rem',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <Clock size={11} />
                      <span>{formatTime(alert.detectedAt)}</span>
                      <span>•</span>
                      <span>{getTimeAgo(alert.detectedAt)}</span>
                    </div>
                  </div>

                  {/* Middle row: Snapshot thumbnail + details */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {snapshotUrl ? (
                      <div
                        onClick={() =>
                          setPreviewImage({
                            url: snapshotUrl,
                            title: alert.cameraName.toUpperCase(),
                            time: formatTime(alert.detectedAt),
                          })
                        }
                        title="Click to zoom snapshot"
                        style={{
                          width: '90px',
                          height: '56px',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          background: '#000',
                          border: '1px solid var(--border-party)',
                          position: 'relative',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        <img
                          src={snapshotUrl}
                          alt="Motion snapshot"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.15s ease',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
                        >
                          <Maximize2 size={14} color="#fff" />
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          width: '90px',
                          height: '56px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px dashed var(--border-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <Radio size={16} color="var(--text-muted)" />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: alert.acknowledged ? 'var(--text-secondary)' : 'var(--text-party)',
                          fontFamily: 'var(--font-mono)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span>{t.alerts.motionDetected}</span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '2px',
                        }}
                      >
                        {t.alerts.labelPrefix}: {alert.label?.toUpperCase() || 'MOTION'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom row: Ack button & Delete button */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                      paddingTop: '8px',
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
                          padding: '3px 8px',
                          fontSize: '0.68rem',
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Check size={12} />
                        {t.alerts.ack}
                      </button>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.68rem',
                          color: 'var(--text-muted)',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        <CheckCheck size={13} color="#10b981" />
                        {t.alerts.acked}
                      </div>
                    )}

                    <button
                      onClick={() => deleteAlert(alert.id)}
                      title={t.alerts.delete}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-red)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
