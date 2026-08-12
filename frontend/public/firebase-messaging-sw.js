importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAvcVSlqgDz3xikH5ybYXQWoMUNrbyviv8",
  authDomain: "erythronet-emergency-blood-net.firebaseapp.com",
  projectId: "erythronet-emergency-blood-net",
  storageBucket: "erythronet-emergency-blood-net.firebasestorage.app",
  messagingSenderId: "195574177790",
  appId: "1:195574177790:web:541f5d7c7893eead486aaf"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  const notificationTitle = payload.notification.title || "Emergency Blood Needed!";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
