import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

const providedApiKey = import.meta.env.VITE_FIREBASE_API_KEY;

// Firebase configuration using Vite environment variables or default fallbacks
const firebaseConfig = {
  apiKey: providedApiKey || "AIzaSyAvcVSlqgDz3xikH5ybYXQWoMUNrbyviv8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "erythronet-emergency-blood-net.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "erythronet-emergency-blood-net",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "erythronet-emergency-blood-net.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "195574177790",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:195574177790:web:541f5d7c7893eead486aaf"
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

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  if (auth && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    auth.settings.appVerificationDisabledForTesting = true;
  }
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn("⚠️ Firebase failed to initialize:", error);
}

// HARD DISABLED FCM MESSAGING TO PREVENT HTTP 400 FIREBASE INSTALLATION ERRORS
export const messaging = null;

export const requestNotificationPermission = async (): Promise<string | null> => {
  // Completely bypassed to avoid Google Installations API network calls
  return null;
};

export const subscribeToCityTopic = async (_city: string): Promise<void> => {
  // Completely bypassed to avoid Google Installations API network calls
  return;
};

export { auth, db, storage, googleProvider };
export default app;