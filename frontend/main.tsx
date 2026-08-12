import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { messaging, requestNotificationPermission } from './lib/firebase'
import { onMessage } from 'firebase/messaging'

// Register Firebase Messaging Service Worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('✅ FCM Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.warn('⚠️ FCM Service Worker registration skipped or failed:', err);
    });

  // Request notification permission on initialization
  requestNotificationPermission();

  // Listen for foreground FCM messages
  if (messaging) {
    onMessage(messaging, (payload) => {
      console.log('🔔 [FCM Foreground Alert]:', payload);
      if (Notification.permission === 'granted') {
        const title = payload.notification?.title || 'ErythroNet Alert';
        const options = {
          body: payload.notification?.body || 'Emergency request update received!',
          icon: '/favicon.ico',
        };
        new Notification(title, options);
      }
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
