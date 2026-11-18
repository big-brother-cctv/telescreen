import React, { useState } from 'react';
import { Home, ShieldAlert } from 'lucide-react';
import { useAlerts } from '../context/AlertsContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getAiLabelInfo } from '../utils/aiLabel';
import type { AlarmMode } from '../types';

/** Editor de qué clases de detección avisan en cada modo (admin/operator). */
export const NotificationRulesPanel: React.FC = () => {
  const { notificationSettings, notificationClasses, updateNotificationRules } = useAlerts();
  const { t, language } = useLanguage();
  const [saving, setSaving] = useState(false);

  if (!notificationSettings || notificationClasses.length === 0) return null;

  const classLabel = (c: string) => {
    if (c === 'motion') return t.alerts.classMotion;
    if (c === 'other') return t.alerts.classOther;
    return getAiLabelInfo(c, language).text;
  };

  const toggle = async (mode: AlarmMode, cls: string) => {
    if (saving) return;
    const home = [...notificationSettings.home];
    const away = [...notificationSettings.away];
    const list = mode === 'home' ? home : away;
    const idx = list.indexOf(cls);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(cls);
    setSaving(true);
    try {
      await updateNotificationRules(home, away);
    } catch {
      alert(t.alerts.rulesError);
    } finally {
      setSaving(false);
    }
  };

  const row = (mode: AlarmMode) => {
    const active = mode === 'home' ? notificationSettings.home : notificationSettings.away;
    const isCurrent = notificationSettings.mode === mode;
    const color = mode === 'home' ? '#10b981' : 'var(--accent-red)';
    return (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', minWidth: '92px',
          fontSize: '0.72rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color,
          textTransform: 'uppercase', paddingTop: '5px',
        }}>
          {mode === 'home' ? <Home size={13} /> : <ShieldAlert size={13} />}
          {mode === 'home' ? t.alerts.rulesHome : t.alerts.rulesAway}
          {isCurrent && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
          {notificationClasses.map((cls) => {
            const on = active.includes(cls);
            return (
              <button
                key={cls}
                type="button"
                onClick={() => toggle(mode, cls)}
                disabled={saving}
                aria-pressed={on}
                className="btn-ghost"
                style={{
                  padding: '4px 9px',
                  fontSize: '0.66rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  borderColor: on ? color : 'var(--border-subtle)',
                  color: on ? '#fff' : 'var(--text-muted)',
                  background: on ? (mode === 'home' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(225, 29, 72, 0.18)') : 'transparent',
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {classLabel(cls)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="glass-panel" style={{ padding: '14px 16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', fontFamily: 'var(--font-display)' }}>
          {t.alerts.rulesTitle}
        </div>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>{t.alerts.rulesHint}</div>
      </div>
      {row('home')}
      {row('away')}
    </div>
  );
};
