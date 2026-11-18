import React from 'react';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Download, Camera } from 'lucide-react';

export const SnapshotModal: React.FC = () => {
  const { previewImage, setPreviewImage } = useAlerts();
  const { t } = useLanguage();

  if (!previewImage) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = previewImage.clipUrl || previewImage.url;
    a.download = previewImage.clipUrl
      ? `clip_${previewImage.title}_${Date.now()}.mp4`
      : `snapshot_${previewImage.title}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={() => setPreviewImage(null)}
      className="modal-overlay"
      style={{
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 10000,
        flexDirection: 'column',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '100%',
          maxHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#090a0f',
          border: '1px solid var(--border-party)',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.95)',
        }}
      >
        {/* Modal Top Bar */}
        <div
          style={{
            padding: '10px 16px',
            background: 'rgba(15, 18, 26, 0.95)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={16} color="var(--accent-red)" />
            <span
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 900,
                fontSize: '0.85rem',
                color: '#fff',
              }}
            >
              {previewImage.title}
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
              • {previewImage.time}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleDownload}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '0.72rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title={t.alertsTab.downloadSnapshot}
            >
              <Download size={14} />
              <span>{t.common.save}</span>
            </button>

            <button
              onClick={() => setPreviewImage(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={t.common.cancel}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Snapshot Image with tactical grid backdrop */}
        <div style={{ background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {previewImage.clipUrl ? (
            // Clip del evento (búfer de MediaMTX); la foto hace de póster mientras carga
            <video
              src={previewImage.clipUrl}
              poster={previewImage.url}
              controls
              autoPlay
              muted
              playsInline
              preload="metadata"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100dvh - 50px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)',
                display: 'block',
                background: '#000',
              }}
            />
          ) : (
            <img
              src={previewImage.url}
              alt="Motion Alert Snapshot"
              style={{
                maxWidth: '100%',
                maxHeight: 'calc(100dvh - 50px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 32px)',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
