import React, { useState } from 'react';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAiLabelInfo } from '../utils/aiLabel';
import type { MotionAlert } from '../types';
import {
  Clock,
  Check,
  X,
  Maximize2,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface SingleToastProps {
  alert: MotionAlert;
  onDismiss: () => void;
}

const SingleMotionToast: React.FC<SingleToastProps> = ({ alert, onDismiss }) => {
  const { t, language } = useLanguage();
  const { ackAlert, setIsDrawerOpen, setPreviewImage } = useAlerts();
  const [isAcked, setIsAcked] = useState(alert.acknowledged);

  const snapshotUrl = alert.snapshotPath
    ? `/api/alerts/snapshots/${alert.snapshotPath.split('/').pop()}`
    : '';

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    } catch {
      return isoString;
    }
  };

  const handleAck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAcked(true);
    await ackAlert(alert.id);
    setTimeout(onDismiss, 800);
  };

  const handleOpenDrawer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDrawerOpen(true);
    onDismiss();
  };

  const handleOpenPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (snapshotUrl) {
      setPreviewImage({
        url: snapshotUrl,
        title: alert.cameraName.toUpperCase(),
        time: formatTime(alert.detectedAt),
      });
    }
  };

  return (
    <div
      style={{
        width: '380px',
        maxWidth: 'calc(100vw - 32px)',
        background: 'rgba(13, 16, 24, 0.96)',
        backdropFilter: 'blur(16px)',
        border: `1px solid ${isAcked ? 'var(--accent-teal)' : 'rgba(225, 29, 72, 0.7)'}`,
        borderRadius: '8px',
        boxShadow: isAcked
          ? '0 8px 32px rgba(0, 240, 255, 0.2)'
          : '0 8px 32px rgba(225, 29, 72, 0.35)',
        overflow: 'hidden',
        animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          padding: '8px 12px',
          background: isAcked
            ? 'rgba(0, 240, 255, 0.1)'
            : 'linear-gradient(90deg, rgba(225, 29, 72, 0.25) 0%, rgba(13, 16, 24, 0) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isAcked ? 'var(--accent-teal)' : 'var(--accent-red)',
              boxShadow: isAcked
                ? '0 0 10px var(--accent-teal)'
                : '0 0 10px var(--accent-red)',
              animation: isAcked ? 'none' : 'pulse-fast 1s infinite',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              color: isAcked ? 'var(--accent-teal)' : 'var(--accent-red)',
              textTransform: 'uppercase',
            }}
          >
            {isAcked ? t.alerts.acked : t.alerts.badge}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>•</span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: '0.8rem',
              color: '#fff',
              letterSpacing: '0.02em',
            }}
          >
            {alert.cameraName.toUpperCase()}
          </span>
        </div>

        <button
          onClick={onDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
          }}
          title={t.common.cancel}
        >
          <X size={15} />
        </button>
      </div>

      {/* Body: Thumbnail & Metadata */}
      <div style={{ padding: '12px', display: 'flex', gap: '12px', alignItems: 'center' }}>
        {snapshotUrl ? (
          <div
            onClick={handleOpenPreview}
            style={{
              width: '110px',
              height: '70px',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#000',
              border: '1px solid rgba(225, 29, 72, 0.4)',
              position: 'relative',
              cursor: 'pointer',
              flexShrink: 0,
            }}
            title={t.alerts.zoomSnapshot}
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
              <Maximize2 size={16} color="#fff" />
            </div>

            {/* Cartel IA sobre la foto en notificación */}
            {(() => {
              const aiInfo = getAiLabelInfo(alert.label, language);
              return (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    background: 'rgba(10, 13, 20, 0.9)',
                    color: aiInfo.isAi ? 'var(--accent-party)' : 'var(--text-secondary)',
                    fontSize: '0.58rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    zIndex: 2,
                  }}
                >
                  <span>{aiInfo.icon}</span>
                  <span>{aiInfo.text}</span>
                </div>
              );
            })()}
          </div>
        ) : (
          <div
            style={{
              width: '110px',
              height: '70px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px dashed var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ShieldAlert size={22} color="var(--accent-red)" />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              color: '#fff',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.2,
            }}
          >
            {t.alerts.motionDetected}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <Clock size={12} />
            <span>{formatTime(alert.detectedAt)}</span>
          </div>

          <div
            style={{
              fontSize: '0.68rem',
              color: 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)',
              marginTop: '2px',
            }}
          >
            {t.alerts.sectorPrefix}:{' '}
            {(() => {
              const aiInfo = getAiLabelInfo(alert.label, language);
              return (
                <span style={{ color: aiInfo.isAi ? 'var(--accent-party)' : 'inherit', fontWeight: 700 }}>
                  {aiInfo.icon} {aiInfo.text}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div
        style={{
          padding: '8px 12px',
          background: 'rgba(9, 11, 16, 0.8)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <button
          onClick={handleAck}
          disabled={isAcked}
          style={{
            background: isAcked ? 'rgba(0, 240, 255, 0.15)' : 'rgba(225, 29, 72, 0.2)',
            border: `1px solid ${isAcked ? 'var(--accent-teal)' : 'var(--accent-red)'}`,
            color: isAcked ? 'var(--accent-teal)' : '#fff',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            cursor: isAcked ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            transition: 'all 0.15s ease',
          }}
        >
          <Check size={13} />
          {isAcked ? t.alerts.acked : t.alerts.ack}
        </button>

        <button
          onClick={handleOpenDrawer}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            borderRadius: '4px',
            padding: '4px 10px',
            fontSize: '0.72rem',
            fontFamily: 'var(--font-mono)',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span>{t.alerts.viewInPanel}</span>
          <ExternalLink size={12} />
        </button>
      </div>

      {/* Auto-dismiss countdown bar */}
      <div
        style={{
          height: '2px',
          background: isAcked ? 'var(--accent-teal)' : 'var(--accent-red)',
          width: '100%',
          animation: 'countdownBar 9s linear forwards',
          transformOrigin: 'left',
        }}
      />
    </div>
  );
};

export const MotionToastContainer: React.FC = () => {
  const { activeToasts, dismissToast } = useAlerts();

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column-reverse',
        gap: '12px',
        pointerEvents: 'auto',
      }}
    >
      {activeToasts.map((alert) => (
        <SingleMotionToast
          key={alert.id}
          alert={alert}
          onDismiss={() => dismissToast(alert.id)}
        />
      ))}
    </div>
  );
};
