import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Firebase configuration using Vite environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;
const googleProvider = new GoogleAuthProvider();

// Optional: Prompt account selection on every Google login
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
    console.warn("⚠️ VITE_FIREBASE_API_KEY is not defined in .env.local!");
} else {
    try {
        app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        if (auth && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            auth.settings.appVerificationDisabledForTesting = true;
        }
        db = getFirestore(app);
        storage = getStorage(app);
    } catch (error) {
        console.warn("⚠️ Firebase failed to initialize. Check your API keys in .env.local:", error);
    }
}

import { getMessaging, getToken, Messaging } from 'firebase/messaging';
import { donorsApi } from '../../lib/api';

export let messaging: Messaging | null = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    if (app) {
      messaging = getMessaging(app);
    }
  } catch (err) {
    console.warn("⚠️ FCM Messaging unavailable in current browser context:", err);
  }
}

export const requestNotificationPermission = async () => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted" && messaging) {
      const token = await getToken(messaging, {
        vapidKey: "BNsDltm9xL0nNIPZ2yxHciV51L20h6PUsvW7sLVQ-1-IZ4GXAgwlzdkf6xAJvTo0D4nBlACfb0wC6-6ireaRTBE"
      });
      console.log("FCM Device Token:", token);
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
  return null;
};

export const subscribeToCityTopic = async (city: string) => {
  try {
    const token = await requestNotificationPermission();
    if (!token) return;
    
    const safeCity = `city_${city.toLowerCase().trim().replace(/\s+/g, '_')}`;
    await donorsApi.subscribeTopic(token, safeCity);
    console.log(`[FCM] Subscribed to topic: ${safeCity}`);
  } catch (error) {
    console.warn("⚠️ FCM topic subscription failed:", error);
  }
};

export { auth, db, storage, googleProvider };
export default app;