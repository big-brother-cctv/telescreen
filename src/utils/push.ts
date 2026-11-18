// Web Push (VAPID): suscribe el service worker para recibir alertas con la app cerrada
// o el móvil bloqueado. En iOS requiere añadir la web a la pantalla de inicio (PWA).
import { api } from '../services/api';

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  window.isSecureContext &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function sameKey(a: ArrayBuffer | null | undefined, b: Uint8Array): boolean {
  if (!a) return false;
  const av = new Uint8Array(a);
  return av.length === b.length && av.every((v, i) => v === b[i]);
}

/**
 * Asegura que este navegador tiene una suscripción push registrada en la API.
 * Idempotente: se puede llamar en cada carga. Devuelve true si push queda activo.
 */
export async function ensurePushSubscription(): Promise<boolean> {
  if (!isPushSupported() || Notification.permission !== 'granted') return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const { publicKey } = await api.getVapidPublicKey();
    const serverKey = urlBase64ToUint8Array(publicKey);

    let sub = await reg.pushManager.getSubscription();
    if (sub && !sameKey(sub.options.applicationServerKey, serverKey)) {
      // Las claves VAPID cambiaron: la suscripción antigua ya no sirve
      await sub.unsubscribe();
      sub = null;
    }
    if (!sub) {
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: serverKey });
    }
    await api.subscribePush(sub.toJSON());
    return true;
  } catch (e) {
    console.warn('[Push] No se pudo activar Web Push:', e);
    return false;
  }
}

/** Da de baja este navegador (logout): deja de recibir alertas de esta cuenta. */
export async function disablePushSubscription(): Promise<void> {
  if (!isPushSupported()) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;
    await api.unsubscribePush(sub.endpoint).catch(() => undefined);
    await sub.unsubscribe();
  } catch (e) {
    console.warn('[Push] Error al dar de baja Web Push:', e);
  }
}
