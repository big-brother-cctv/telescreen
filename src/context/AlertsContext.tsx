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
  triggerTestAlert: (cameraName?: string) => Promise<void>;
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

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    localStorage.setItem('bb_alert_sound', String(val));
  };

  const dismissToast = (id: number) => {
    setActiveToasts((prev) => prev.filter((item) => item.id !== id));
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

  // Carga inicial
  useEffect(() => {
    if (authStorage.getToken()) {
      refreshAlerts();
    }
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
              return [newAlert, ...prev.slice(0, 49)];
            });
            setUnreadCount((c) => c + 1);

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

            // Notificación nativa del navegador
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              const snapshotUrl = newAlert.snapshotPath ? `/api/alerts/snapshots/${newAlert.snapshotPath.split('/').pop()}` : '/favicon.svg';
              try {
                new Notification(`🚨 CCTV - ${newAlert.cameraName.toUpperCase()}`, {
                  body: `${t.alerts.motionDetected} (${newAlert.label || 'motion'})`,
                  icon: snapshotUrl,
                  tag: `bb-alert-${newAlert.id}`,
                });
              } catch {
                // Ignore
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
    try {
      await api.ackAlert(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      setActiveToasts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  const ackAllAlerts = async () => {
    try {
      await api.ackAllAlerts();
      setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
      setUnreadCount(0);
      setActiveToasts([]);
    } catch (err) {
      console.error('Failed to ack all alerts:', err);
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

  // Simular alerta de prueba táctica con captura generada
  const triggerTestAlert = async (cameraName = 'camera') => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(0, 0, 640, 360);

        // Cuadrícula táctica
        ctx.strokeStyle = '#1e2638';
        ctx.lineWidth = 1;
        for (let x = 0; x < 640; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 360);
          ctx.stroke();
        }
        for (let y = 0; y < 360; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(640, y);
          ctx.stroke();
        }

        // Bounding box de movimiento en rojo
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 3;
        ctx.strokeRect(180, 80, 280, 190);
        ctx.fillStyle = 'rgba(225, 29, 72, 0.18)';
        ctx.fillRect(180, 80, 280, 190);

        // Crosshair central
        ctx.beginPath();
        ctx.arc(320, 175, 12, 0, 2 * Math.PI);
        ctx.stroke();

        ctx.fillStyle = '#e11d48';
        ctx.font = 'bold 15px monospace';
        ctx.fillText('TARGET DETECTED [MOTION 99.2%]', 185, 72);

        ctx.fillStyle = '#00f0ff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`CAM: ${cameraName.toUpperCase()}`, 20, 30);
        ctx.fillText(`TIMESTAMP: ${new Date().toISOString()}`, 20, 50);
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const formData = new FormData();
      formData.append('camera_name', cameraName);
      formData.append('label', 'motion');
      formData.append('severity', 'warning');
      formData.append('confidence', '0.99');
      formData.append('ignore_cooldown', 'true');
      if (blob) {
        formData.append('image', blob, `test_motion_${Date.now()}.jpg`);
      }

      await api.createAlert(formData);
    } catch (e) {
      console.error('Error triggering test alert:', e);
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
        triggerTestAlert,
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
