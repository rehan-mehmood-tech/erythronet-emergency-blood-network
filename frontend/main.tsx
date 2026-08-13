import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { messaging } from './lib/firebase'
// import { onMessage } from 'firebase/messaging'

// ─── Suppress noisy background errors ────────────────────────────────────────
// Catches unhandled promise rejections from background polling,
// MaxMind GeoIP CORS errors, and ERR_CONNECTION_REFUSED traces.
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const msg: string = event.reason?.message ?? String(event.reason ?? '');
  const isNetworkNoise =
    msg.includes('Failed to fetch') ||
    msg.includes('ERR_CONNECTION_REFUSED') ||
    msg.includes('geoip.maxmind.com') ||
    msg.includes('NetworkError');

  if (isNetworkNoise) {
    event.preventDefault(); // Suppress the browser console red trace
  }
});

// Register Firebase Messaging Service Worker if FCM is enabled
const isFcmEnabled = import.meta.env.VITE_ENABLE_FCM === 'true';

if (typeof window !== 'undefined' && 'serviceWorker' in navigator && isFcmEnabled) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ FCM Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.warn('⚠️ FCM Service Worker registration skipped or failed:', err);
    });

  // [PURGED]: requestNotificationPermission();

  // [PURGED]: Foreground FCM messages listener
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
