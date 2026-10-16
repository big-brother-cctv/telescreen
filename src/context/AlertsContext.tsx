import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { MotionAlert } from '../types';
import { api, authStorage } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface AlertsContextType {
  alerts: MotionAlert[];
  unreadCount: number;
  activeAlertCameras: Set<string>;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  browserNotificationsEnabled: boolean;
  notificationPermission: NotificationPermission;
  requestNotificationPermission: () => Promise<boolean>;
  ackAlert: (id: number) => Promise<void>;
  ackAllAlerts: () => Promise<void>;
  deleteAlert: (id: number) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  refreshAlerts: () => Promise<void>;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
}

const AlertsContext = createContext<AlertsContextType | undefined>(undefined);

// Web Audio API Synthesizer (100% self-hosted, offline, no audio files)
function playTacticalAlarmTone() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Frequency chirp: 920Hz down to 460Hz, twice
    osc.frequency.setValueAtTime(920, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(460, ctx.currentTime + 0.12);
    osc.frequency.setValueAtTime(920, ctx.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(460, ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.32);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.33);
  } catch (e) {
    console.debug('Tactical audio playback was blocked or unsupported:', e);
  }
}

export const AlertsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<MotionAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [activeAlertCameras, setActiveAlertCameras] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('bb_alert_sound') !== 'false';
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const cameraAlertTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem('bb_alert_sound', String(val));
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      return perm === 'granted';
    } catch {
      return false;
    }
  };

  const markCameraActive = (cameraName: string) => {
    if (!cameraName) return;
    setActiveAlertCameras((prev) => {
      const next = new Set(prev);
      next.add(cameraName);
      return next;
    });

    // Clear existing timer if any
    const existing = cameraAlertTimersRef.current.get(cameraName);
    if (existing) clearTimeout(existing);

    // Keep camera highlighted for 25 seconds
    const timer = setTimeout(() => {
      setActiveAlertCameras((prev) => {
        const next = new Set(prev);
        next.delete(cameraName);
        return next;
      });
      cameraAlertTimersRef.current.delete(cameraName);
    }, 25000);

    cameraAlertTimersRef.current.set(cameraName, timer);
  };

  const refreshAlerts = async () => {
    if (!authStorage.getToken()) return;
    try {
      const [resAlerts, resUnread] = await Promise.allSettled([
        api.getAlerts({ limit: 40 }),
        api.getUnreadAlertsCount(),
      ]);

      if (resAlerts.status === 'fulfilled' && resAlerts.value?.alerts) {
        setAlerts(resAlerts.value.alerts);
      }
      if (resUnread.status === 'fulfilled' && typeof resUnread.value?.unreadCount === 'number') {
        setUnreadCount(resUnread.value.unreadCount);
      }
    } catch (err) {
      console.error('Error refreshing alerts:', err);
    }
  };

  // Initial load
  useEffect(() => {
    if (authStorage.getToken()) {
      refreshAlerts();
    }
  }, []);

  // SSE Realtime Subscription
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      try {
        // SSE natively connects to /api/alerts/stream
        eventSource = new EventSource('/api/alerts/stream');

        eventSource.addEventListener('alert', (event: MessageEvent) => {
          try {
            const newAlert: MotionAlert = JSON.parse(event.data);
            setAlerts((prev) => {
              // Avoid duplicates
              if (prev.some((a) => a.id === newAlert.id)) return prev;
              return [newAlert, ...prev.slice(0, 49)];
            });
            setUnreadCount((c) => c + 1);

            // Mark camera tile with tactical pulse
            if (newAlert.cameraName) {
              markCameraActive(newAlert.cameraName);
            }

            // Play synthesized tactical audio beep
            if (localStorage.getItem('bb_alert_sound') !== 'false') {
              playTacticalAlarmTone();
            }

            // Native Browser Notification (100% locally created by browser)
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const snapshotUrl = newAlert.snapshotPath ? `/api/alerts/snapshots/${newAlert.snapshotPath.split('/').pop()}` : '/favicon.svg';
              try {
                new Notification(`🚨 CCTV - ${newAlert.cameraName.toUpperCase()}`, {
                  body: `${t.alerts.motionDetected} (${newAlert.label || 'motion'})`,
                  icon: snapshotUrl,
                  tag: `bb-alert-${newAlert.id}`,
                });
              } catch {
                // Ignore notification display restrictions in background
              }
            }
          } catch (e) {
            console.error('Error handling SSE alert event:', e);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Reconnect after 5s
          retryTimeout = setTimeout(connectSSE, 5000);
        };
      } catch (err) {
        console.error('Failed to initialize SSE:', err);
        retryTimeout = setTimeout(connectSSE, 5000);
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      // Clear timers
      cameraAlertTimersRef.current.forEach((t) => clearTimeout(t));
      cameraAlertTimersRef.current.clear();
    };
  }, [t]);

  const ackAlert = async (id: number) => {
    try {
      await api.ackAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  const ackAllAlerts = async () => {
    try {
      await api.ackAllAlerts();
      setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to ack all alerts:', err);
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      // Re-fetch unread count
      const res = await api.getUnreadAlertsCount();
      if (typeof res?.unreadCount === 'number') {
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  const clearAllAlerts = async () => {
    try {
      await api.clearAllAlerts();
      setAlerts([]);
      setUnreadCount(0);
      setActiveAlertCameras(new Set());
    } catch (err) {
      console.error('Failed to clear all alerts:', err);
    }
  };

  return (
    <AlertsContext.Provider
      value={{
        alerts,
        unreadCount,
        activeAlertCameras,
        soundEnabled,
        setSoundEnabled,
        browserNotificationsEnabled: notificationPermission === 'granted',
        notificationPermission,
        requestNotificationPermission,
        ackAlert,
        ackAllAlerts,
        deleteAlert,
        clearAllAlerts,
        refreshAlerts,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </AlertsContext.Provider>
  );
};

export const useAlerts = (): AlertsContextType => {
  const context = useContext(AlertsContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertsProvider');
  }
  return context;
};
