import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, subscribeToCityTopic } from '../lib/firebase';
import { donorsApi } from '../../lib/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  googleLogin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync Firebase Auth State with SQLite/LocalStorage Donor State
  const syncDonorState = async (firebaseUser: User | null) => {
    if (firebaseUser) {
      try {
        // Try fetching donor profile
        const donorProfile = await donorsApi.getById(firebaseUser.uid);
        if (donorProfile) {
          localStorage.setItem('erythronet_current_user', JSON.stringify(donorProfile));
          if (donorProfile.city) {
            subscribeToCityTopic(donorProfile.city);
          }
        } else {
          // If logged in via firebase but no donor profile exists yet, remove old session cache
          localStorage.removeItem('erythronet_current_user');
        }
      } catch (err) {
        // Safe to ignore if not registered as donor yet
        localStorage.removeItem('erythronet_current_user');
      }
    } else {
      localStorage.removeItem('erythronet_current_user');
    }
    // Notify components of auth change
    window.dispatchEvent(new Event('erythronet_auth_changed'));
  };

  useEffect(() => {
    if (!auth) {
      console.warn("⚠️ Firebase Auth is not initialized. Check VITE_FIREBASE_API_KEY environment variable.");
      setLoading(false);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await syncDonorState(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify your VITE_FIREBASE_API_KEY in .env.local');
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (email: string, pass: string, name: string) => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify your VITE_FIREBASE_API_KEY in .env.local');
    }
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    if (credential.user) {
      await updateProfile(credential.user, { displayName: name });
      // Update state local mapping
      setUser({ ...credential.user, displayName: name });
    }
  };

  const logout = async () => {
    if (!auth) {
      localStorage.removeItem('erythronet_current_user');
      window.dispatchEvent(new Event('erythronet_auth_changed'));
      return;
    }
    await signOut(auth);
    localStorage.removeItem('erythronet_current_user');
    window.dispatchEvent(new Event('erythronet_auth_changed'));
  };

  const googleLogin = async () => {
    if (!auth) {
      throw new Error('Firebase Auth is not initialized. Please verify your VITE_FIREBASE_API_KEY in .env.local');
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, googleLogin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
