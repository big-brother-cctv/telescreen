import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Fuentes empaquetadas con la app (funcionan offline y sin peticiones a Google Fonts)
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/jetbrains-mono'
import '@fontsource-variable/plus-jakarta-sans'
import './index.css'
import App from './App.tsx'
import { LanguageProvider } from './i18n/LanguageContext.tsx'

// Register Tactical Service Worker for PWA & Native Notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.debug('[SW] Telescreen Service Worker registered:', reg.scope);
      })
      .catch((err) => {
        console.debug('[SW] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)
