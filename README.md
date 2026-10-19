# Big Brother CCTV — Telescreen (Frontend)

Panel web táctico de videovigilancia y monitorización en tiempo real, desarrollado con **React 19**, **Vite**, **TypeScript**, **HLS.js** y **Lucide Icons**.

---

## 🌟 Características Principales

- **Dashboard Táctico & Telemetría en Vivo**:
  - Resumen ejecutivo de cámaras activas, sectores en alarma y estado del radar acústico.
  - Telemetría en vivo del estado de los servicios centrales (**MediaMTX**, **API Core**, **Motion Detector**, **PostgreSQL**).
  - Carrusel y galería de instantáneas forenses recientes con acceso directo al visor ampliado.
- **Live Matrix (Cuadrícula Reactiva)**:
  - Distribuciones adaptativas: Automático, Foco 1x1, Mosaico 2x2 y Matriz 3x3.
  - Streaming con latencia ultra-baja vía HLS directo (`/stream/<nombre>/index.m3u8`).
  - Captura instantánea de fotografías forenses en alta resolución directa desde el canvas de vídeo.
- **Notificaciones Forenses & Archivo de Snapshots**:
  - Recepción en tiempo real de eventos de intrusión mediante **Server-Sent Events (SSE)**.
  - Alarma sonora con sintetizador acústico integrado (radar de alerta de audio).
  - Filtro por cámara, estado (pendientes / confirmadas) y búsqueda por nombre.
  - Modal de inspección forense a pantalla completa con navegación por carrusel y descarga de archivo.
  - Acuse de recibo individual / masivo y eliminación física con borrado automático en el servidor.
- **Diseño 100% Responsive & Experiencia Móvil**:
  - Barra de navegación inferior persistente con soporte para `safe-area-inset` en iOS y Android.
  - Modo pantalla completa móvil optimizado sin interferencia de los reproductores nativos del sistema operativo.
  - Control táctil intuitivo (tap para mostrar/ocultar interfaz, doble tap para pantalla completa).
  - Eliminación de ruido visual innecesario en móviles y badges contextuales limpios (`RTMP`, `IP / RTSP`, `TEST`, `USB`).
- **Gestión Universal de Cámaras**:
  - Creación y edición en caliente de cámaras:
    - **Cámaras IP / NVR** (RTSP/HTTP Pull).
    - **Emisión Externa Push** (OBS, Teléfonos móviles, RTMP push).
    - **Dispositivos Locales / Edge** (Webcams USB `/dev/video*`).
    - **Generador Sintético SMPTE** (Señal de pruebas sin hardware).
  - Configuración de umbral de detección de movimiento, frames mínimos y tiempo de cooldown.
- **Internacionalización Dinámica (i18n)**:
  - Soporte completo para **Español** e **Inglés**, con persistencia en `localStorage`.

---

## 🛠️ Tecnologías Utilizadas

- **Framework**: React 19 + TypeScript + Vite
- **Streaming de Vídeo**: HLS.js (HTTP Live Streaming)
- **Iconografía**: Lucide React
- **Estilos**: Vanilla CSS con diseño brutalista oscuro, efectos de escaneo CRT y tokens HSL
- **Comunicación en Tiempo Real**: Server-Sent Events (SSE) y REST API

---

## 🚀 Comandos de Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 4200)
# (Incluye proxies automáticos configurados en vite.config.ts hacia la API y MediaMTX)
npm run dev

# 3. Compilar bundle de producción optimizado
npm run build

# 4. Vista previa de la compilación de producción
npm run preview
```

---

## ⚙️ Configuración del Proxy (Desarrollo Local)

En desarrollo local (`vite.config.ts`), Telescreen redirige automáticamente las siguientes rutas:
- `/api` ➡️ `http://localhost:8080/api` (API Core)
- `/stream` ➡️ `http://localhost:8888` (MediaMTX HLS)

---

## 📁 Estructura del Proyecto

```
telescreen/
├── src/
│   ├── components/         # Reproductores, modales, alertas y navegación
│   ├── context/            # Contextos de autenticación, alertas SSE y sonido
│   ├── i18n/               # Diccionarios de traducción (ES / EN) y hook de idioma
│   ├── services/           # Clientes HTTP y conexión a la API REST
│   ├── views/              # Vistas: Dashboard, LiveGrid, Alerts, Cameras, Users
│   ├── index.css           # Sistema de diseño responsive y tokens de estilo
│   └── main.tsx            # Punto de entrada de la aplicación React
├── index.html              # HTML con configuración PWA / meta tags para móviles
├── package.json
└── vite.config.ts
```