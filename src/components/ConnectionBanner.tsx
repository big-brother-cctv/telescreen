import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

/** Franja visible mientras el dispositivo no tiene conexión (la app abre desde la caché). */
export const ConnectionBanner: React.FC = () => {
  const { t } = useLanguage();
  const [online, setOnline] = useState<boolean>(() => typeof navigator === 'undefined' || navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (online) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '6px max(12px, env(safe-area-inset-right, 0px)) 6px max(12px, env(safe-area-inset-left, 0px))',
        background: 'rgba(245, 158, 11, 0.14)',
        borderBottom: '1px solid var(--border-amber)',
        color: 'var(--accent-amber)',
        fontSize: '0.72rem',
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        textAlign: 'center',
      }}
    >
      <WifiOff size={14} style={{ flexShrink: 0 }} />
      <span>{t.alerts.offlineBanner}</span>
    </div>
  );
};
