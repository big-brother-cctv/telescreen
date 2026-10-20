import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { MotionAlert } from '../types';
import { api, authStorage } from '../services/api';
import { useLanguage } from '../i18n/LanguageContext';

interface AlertsContextType {
  alerts: MotionAlert[];
  unreadCount: number;
  activeAlertCameras: Set<string>;
  activeToasts: MotionAlert[];
  dismissToast: (id: number) => void;
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
  totalAlerts: number;
  hasMore: boolean;
  loadMoreAlerts: () => Promise<void>;
  isLoadingMore: boolean;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  previewImage: { url: string; title: string; time: string } | null;
  setPreviewImage: (img: { url: string; title: string; time: string } | null) => void;
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
  const [totalAlerts, setTotalAlerts] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [activeAlertCameras, setActiveAlertCameras] = useState<Set<string>>(new Set());
  const [activeToasts, setActiveToasts] = useState<MotionAlert[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string; time: string } | null>(null);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('bb_alert_sound') !== 'false';
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  const cameraAlertTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const previousAlertIdsRef = useRef<Set<number>>(new Set());

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem('bb_alert_sound', String(val));
  };

  const dismissToast = (id: number) => {
    setActiveToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const triggerNativeNotification = (newAlert: MotionAlert) => {
    if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const snapshotUrl = newAlert.snapshotPath
      ? `/api/alerts/snapshots/${newAlert.snapshotPath.split('/').pop()}`
      : '/favicon-96x96.png';
    const title = `🚨 CCTV - ${newAlert.cameraName.toUpperCase()}`;
    const body = `${t.alerts.motionDetected} (${newAlert.label || 'motion'})`;

    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready
          .then((reg) => {
            return reg.showNotification(title, {
              body,
              icon: '/favicon-96x96.png',
              badge: '/favicon-96x96.png',
              image: snapshotUrl,
              vibrate: [200, 100, 200, 100, 200],
              tag: `bb-alert-${newAlert.id}`,
              renotify: true,
              data: { url: '/?view=alerts', id: newAlert.id },
            } as NotificationOptions);
          })
          .catch(() => {
            new Notification(title, { body, icon: snapshotUrl, tag: `bb-alert-${newAlert.id}` });
          });
      } else {
        new Notification(title, { body, icon: snapshotUrl, tag: `bb-alert-${newAlert.id}` });
      }
    } catch {
      try {
        new Notification(title, { body, icon: snapshotUrl, tag: `bb-alert-${newAlert.id}` });
      } catch {}
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert(t.alerts.notificationsInsecureContext);
      return false;
    }

    if (window.isSecureContext === false && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      alert(t.alerts.notificationsInsecureContext);
      return false;
    }

    if (Notification.permission === 'denied') {
      alert(t.alerts.notificationsBlockedHelp);
      setNotificationPermission('denied');
      return false;
    }

    try {
      let perm: NotificationPermission;
      try {
        perm = await Notification.requestPermission();
      } catch {
        // Fallback for older browsers accepting callback
        perm = await new Promise<NotificationPermission>((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      setNotificationPermission(perm);

      if (perm === 'denied') {
        alert(t.alerts.notificationsBlockedHelp);
        return false;
      }

      if (perm === 'granted') {
        const welcomeTitle = t.alerts.welcomeTitle;
        const welcomeBody = t.alerts.welcomeBody;

        if (localStorage.getItem('bb_alert_sound') !== 'false') {
          playTacticalAlarmTone();
        }

        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(welcomeTitle, {
              body: welcomeBody,
              icon: '/favicon-96x96.png',
              badge: '/favicon-96x96.png',
              tag: 'bb-welcome',
            } as NotificationOptions);
          } else {
            new Notification(welcomeTitle, { body: welcomeBody, icon: '/favicon-96x96.png' });
          }
        } catch {
          try {
            new Notification(welcomeTitle, { body: welcomeBody, icon: '/favicon-96x96.png' });
          } catch {}
        }
      }
      return perm === 'granted';
    } catch (e) {
      console.warn('Failed to request notification permission:', e);
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

    const existing = cameraAlertTimersRef.current.get(cameraName);
    if (existing) clearTimeout(existing);

    // Resaltar cámara durante 25 segundos
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
        api.getAlerts({ limit: 100 }),
        api.getUnreadAlertsCount(),
      ]);

      if (resAlerts.status === 'fulfilled' && resAlerts.value?.alerts) {
        const fetchedAlerts = resAlerts.value.alerts;

        if (typeof resAlerts.value.total === 'number') {
          setTotalAlerts(resAlerts.value.total);
        }

        // Si entran alertas nuevas vía polling, activar toast, sonido y bordes activos
        if (previousAlertIdsRef.current.size > 0) {
          const brandNewAlerts = fetchedAlerts.filter(
            (a) => !previousAlertIdsRef.current.has(a.id) && !a.acknowledged
          );
          if (brandNewAlerts.length > 0) {
            setActiveToasts((prev) => [
              ...brandNewAlerts.slice(0, 2),
              ...prev.filter((t) => !brandNewAlerts.some((b) => b.id === t.id)),
            ].slice(0, 3));

            brandNewAlerts.forEach((a) => {
              if (a.cameraName) markCameraActive(a.cameraName);
              triggerNativeNotification(a);
            });

            if (localStorage.getItem('bb_alert_sound') !== 'false') {
              playTacticalAlarmTone();
            }
          }
        }

        previousAlertIdsRef.current = new Set(fetchedAlerts.map((a) => a.id));
        setAlerts((prev) => {
          if (prev.length > fetchedAlerts.length) {
            const fetchedIds = new Set(fetchedAlerts.map((a) => a.id));
            const olderAlerts = prev.filter((a) => !fetchedIds.has(a.id));
            return [...fetchedAlerts, ...olderAlerts];
          }
          return fetchedAlerts;
        });
      }
      if (resUnread.status === 'fulfilled' && typeof resUnread.value?.unreadCount === 'number') {
        setUnreadCount(resUnread.value.unreadCount);
      }
    } catch (err) {
      console.error('Error refreshing alerts:', err);
    }
  };

  const loadMoreAlerts = async () => {
    if (!authStorage.getToken() || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await api.getAlerts({ limit: 50, offset: alerts.length });
      if (res?.alerts && res.alerts.length > 0) {
        setAlerts((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newAlerts = res.alerts.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newAlerts];
        });
      }
      if (typeof res?.total === 'number') {
        setTotalAlerts(res.total);
      }
    } catch (err) {
      console.error('Error loading more alerts:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Carga inicial y bucle de polling resiliente cada 4s
  useEffect(() => {
    if (!authStorage.getToken()) return;

    refreshAlerts();

    const pollInterval = setInterval(() => {
      refreshAlerts();
    }, 4000);

    return () => clearInterval(pollInterval);
  }, []);

  // Suscripción SSE en tiempo real
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) return;

    let eventSource: EventSource | null = null;
    let retryTimeout: ReturnType<typeof setTimeout> | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource('/api/alerts/stream');

        eventSource.addEventListener('alert', (event: MessageEvent) => {
          try {
            const newAlert: MotionAlert = JSON.parse(event.data);

            setAlerts((prev) => {
              if (prev.some((a) => a.id === newAlert.id)) return prev;
              return [newAlert, ...prev.slice(0, 249)];
            });
            setUnreadCount((c) => c + 1);
            setTotalAlerts((t) => t + 1);

            // Añadir al toast flotante visible en pantalla
            setActiveToasts((prev) => [newAlert, ...prev.filter((t) => t.id !== newAlert.id)].slice(0, 3));
            setTimeout(() => {
              setActiveToasts((prev) => prev.filter((t) => t.id !== newAlert.id));
            }, 9000);

            // Marcar tile de cámara en LiveGrid
            if (newAlert.cameraName) {
              markCameraActive(newAlert.cameraName);
            }

            // Reproducir alarma acústica sintetizada
            if (localStorage.getItem('bb_alert_sound') !== 'false') {
              playTacticalAlarmTone();
            }

            // Notificación nativa del navegador / Service Worker PWA
            triggerNativeNotification(newAlert);
          } catch (e) {
            console.error('Error handling SSE alert event:', e);
          }
        });

        eventSource.onerror = () => {
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
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
      cameraAlertTimersRef.current.forEach((t) => clearTimeout(t));
      cameraAlertTimersRef.current.clear();
    };
  }, [t]);

  const ackAlert = async (id: number) => {
    // Actualización optimista inmediata en la UI
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    setActiveToasts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );

    try {
      await api.ackAlert(id);
    } catch (err) {
      console.error('Failed to ack alert:', err);
      refreshAlerts();
    }
  };

  const ackAllAlerts = async () => {
    // Actualización optimista inmediata en la UI
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    setUnreadCount(0);
    setActiveToasts([]);

    try {
      await api.ackAllAlerts();
    } catch (err) {
      console.error('Failed to ack all alerts:', err);
      refreshAlerts();
    }
  };

  const deleteAlert = async (id: number) => {
    try {
      await api.deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      setActiveToasts((prev) => prev.filter((a) => a.id !== id));
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
      setActiveToasts([]);
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
        activeToasts,
        dismissToast,
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
        totalAlerts,
        hasMore: alerts.length < totalAlerts,
        loadMoreAlerts,
        isLoadingMore,
        isDrawerOpen,
        setIsDrawerOpen,
        previewImage,
        setPreviewImage,
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
