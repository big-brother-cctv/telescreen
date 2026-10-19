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
    a.href = previewImage.url;
    a.download = `snapshot_${previewImage.title}_${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      onClick={() => setPreviewImage(null)}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(12px)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '92vw',
          maxHeight: '88vh',
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
          <img
            src={previewImage.url}
            alt="Motion Alert Snapshot"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(88vh - 50px)',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
};
