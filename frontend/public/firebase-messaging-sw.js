importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

const getConfig = (key, fallback) => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env[key]) || fallback;
  } catch (e) {
    return fallback;
  }
};

firebase.initializeApp({
  apiKey: getConfig('VITE_FIREBASE_API_KEY', "AIzaSyAvcVSlqgDz3xikH5ybYXQWoMUNrbyviv8"),
  authDomain: getConfig('VITE_FIREBASE_AUTH_DOMAIN', "erythronet-emergency-blood-net.firebaseapp.com"),
  projectId: getConfig('VITE_FIREBASE_PROJECT_ID', "erythronet-emergency-blood-net"),
  storageBucket: getConfig('VITE_FIREBASE_STORAGE_BUCKET', "erythronet-emergency-blood-net.firebasestorage.app"),
  messagingSenderId: getConfig('VITE_FIREBASE_MESSAGING_SENDER_ID', "195574177790"),
  appId: getConfig('VITE_FIREBASE_APP_ID', "1:195574177790:web:541f5d7c7893eead486aaf")
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification ? payload.notification.title : "Emergency Blood Needed!";
  const notificationOptions = {
    body: payload.notification ? payload.notification.body : "",
    icon: "/logo.png",
    data: payload.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked.', event);
  event.notification.close();

  const data = event.notification.data || {};
  const requestId = data.requestId;
  
  // Default to live board, or request detail if id is present
  const targetUrl = requestId ? `/request/${requestId}` : '/live-board';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
