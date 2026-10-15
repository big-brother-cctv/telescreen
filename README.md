# Big Brother CCTV — Telescreen (Frontend)

Panel web de control y videovigilancia táctica en tiempo real, desarrollado con **React**, **Vite**, **TypeScript**, **HLS.js** y **Lucide Icons**.

## Características
- **Live Matrix**: Cuadrícula reactiva con layouts (Auto, 2x2, 1x1 Foco), buscador en tiempo real y captura instantánea de snapshots desde el stream de vídeo.
- **Reproductor HLS Integrado**: Streaming con latencia ultra-baja directo desde MediaMTX (`/stream/<nombre>/index.m3u8`), reintento automático y telemetría de codec/fps/buffer.
- **Gestor de Cámaras**: Edición en vivo de parámetros de codificación de hardware (resolución, FPS, códec, device `/dev/videoX`, presets FFmpeg).
- **Control de Operadores**: Gestión de usuarios, perfiles y estados de autorización.
- **Diseño Táctico Premium**: Dark mode estilo centro de mando militar/seguridad, tipografía moderna (`Plus Jakarta Sans` + `JetBrains Mono`), glassmorphism y estado de latencia/conectividad de la API en vivo.

## Comandos Rápidos
```bash
# Instalar dependencias
npm install

# Servidor de desarrollo con proxy a Go (puerto 4200)
npm run dev

# Compilar para producción
npm run build
```
