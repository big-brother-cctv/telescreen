import React, { useState } from 'react';
import { Home, ShieldCheck } from 'lucide-react';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';

/** Interruptor global "En casa" / "Fuera" (decide qué alertas avisan). */
export const AlarmModeToggle: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { notificationSettings, setAlarmMode } = useAlerts();
  const { t } = useLanguage();
  const [busy, setBusy] = useState(false);

  if (!notificationSettings) return null;
  const isHome = notificationSettings.mode === 'home';
  const color = isHome ? '#10b981' : 'var(--accent-red)';

  const toggle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await setAlarmMode(isHome ? 'away' : 'home');
    } catch {
      alert(t.alerts.modeChangeError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className="btn-ghost touch-target"
      title={isHome ? t.alerts.modeHomeTooltip : t.alerts.modeAwayTooltip}
      aria-label={isHome ? t.alerts.modeHomeTooltip : t.alerts.modeAwayTooltip}
      aria-pressed={!isHome}
      style={{
        justifyContent: 'center',
        gap: compact ? '5px' : '6px',
        padding: compact ? '5px 9px' : '6px 10px',
        fontSize: compact ? '0.66rem' : '0.7rem',
        fontWeight: 800,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '0.05em',
        color,
        borderColor: color,
        background: isHome ? 'rgba(16, 185, 129, 0.12)' : 'rgba(225, 29, 72, 0.12)',
        opacity: busy ? 0.6 : 1,
        flexShrink: 0,
      }}
    >
      {/* ShieldCheck (vigilando) para no confundirse con el escudo "!" de Notificaciones */}
      {isHome ? <Home size={14} style={{ flexShrink: 0 }} /> : <ShieldCheck size={14} style={{ flexShrink: 0 }} />}
      {/* También en móvil: solo con el icono no se sabía qué modo estaba activo */}
      <span style={{ lineHeight: 1 }}>{isHome ? t.alerts.modeHome : t.alerts.modeAway}</span>
    </button>
  );
};
