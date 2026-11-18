// Big Brother Telescreen - Service Worker: caché de la app (PWA offline) y Web Push
const CACHE_NAME = 'telescreen-shell-v3';

// Carcasa mínima para abrir la app sin conexión. Los /assets/ con hash se cachean al usarse.
const SHELL_URLS = [
  '/',
  '/site.webmanifest',
  '/favicon.svg',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
];

// Nunca cachear: datos con sesión, vídeo en directo ni health checks
const NETWORK_ONLY_PREFIXES = ['/api/', '/stream/', '/whep/', '/actuator/', '/internal/'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => undefined) // sin red al instalar: se rellenará al navegar
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      ),
    ])
  );
});

const OFFLINE_HTML = `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#08090d"><title>Telescreen · Sin conexión</title>
<style>body{margin:0;min-height:100dvh;display:flex;align-items:center;justify-content:center;
background:#08090d;color:#f8fafc;font-family:system-ui,sans-serif;text-align:center;padding:24px}
b{color:#e11d48;letter-spacing:.08em}button{margin-top:18px;padding:12px 18px;border-radius:8px;
border:1px solid rgba(225,29,72,.5);background:rgba(225,29,72,.15);color:#fff;font-size:1rem}</style>
</head><body><div><b>TELESCREEN</b><p>Sin conexión con el servidor.</p>
<button onclick="location.reload()">Reintentar</button></div></body></html>`;

async function networkFirstNavigation(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/', response.clone()); // la SPA es una sola página
    return response;
  } catch {
    const cached = await cache.match('/');
    return cached || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (NETWORK_ONLY_PREFIXES.some((p) => url.pathname.startsWith(p))) return;

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request)); // ficheros con hash: inmutables
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});

// Push Event: Handles incoming background push notifications (Web Push Protocol)
self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || '🚨 Big Brother CCTV - Alerta';
  const options = {
    body: data.body || 'Alerta de movimiento detectada',
    icon: data.icon || '/favicon-96x96.png',
    badge: '/favicon-96x96.png',
    image: data.image || undefined,
    vibrate: [200, 100, 200, 100, 200],
    tag: data.tag || 'cctv-alert',
    renotify: true,
    data: data.data || { url: '/' },
  };

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // App visible: la página ya muestra el toast y hace sonar la alarma (vía SSE).
      // Las notificaciones de prueba se muestran siempre.
      const appVisible = windowClients.some((c) => c.visibilityState === 'visible' || c.focused);
      if (appVisible && options.tag !== 'bb-push-test') {
        return undefined;
      }
      return self.registration.showNotification(title, options);
    })
  );
});

// Notification Click: Focus existing window or open new window to view alert
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          if ('navigate' in client && targetUrl !== '/') {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
