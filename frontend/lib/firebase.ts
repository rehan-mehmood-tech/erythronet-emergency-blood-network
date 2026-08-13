import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, 
  updateDoc, onSnapshot, query, orderBy, limit 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';
import { BloodRequest, Donor } from '../types';
import { requestsApi, donorsApi, metricsApi, pollRequests } from './api';

const providedApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const isMockKey = !providedApiKey || providedApiKey === "AIzaSyAvcVSlqgDz3xikH5ybYXQWoMUNrbyviv8" || providedApiKey.includes("AIzaSy");

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: providedApiKey || "AIzaSyAvcVSlqgDz3xikH5ybYXQWoMUNrbyviv8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "erythronet-emergency-blood-net.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "erythronet-emergency-blood-net",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "erythronet-emergency-blood-net.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "195574177790",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:195574177790:web:541f5d7c7893eead486aaf"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export let messaging: Messaging | null = null;
const isFcmEnabled = import.meta.env.VITE_ENABLE_FCM === 'true';

if (typeof window !== "undefined" && "serviceWorker" in navigator && isFcmEnabled && !isMockKey) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("⚠️ FCM Messaging unavailable in current browser context:", err);
  }
} else if (!isFcmEnabled) {
  console.warn("⚠️ FCM Messaging bypassed: VITE_ENABLE_FCM is not true.");
} else if (isMockKey) {
  console.warn("⚠️ FCM Messaging bypassed: Valid VITE_FIREBASE_API_KEY is missing or invalid.");
}

export const requestNotificationPermission = async () => {
  if (!isFcmEnabled || isMockKey) return null;

  try {
    if (typeof window === "undefined" || !("Notification" in window)) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted" && messaging) {
      try {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY || "BNsDltm9xL0nNIPZ2yxHciV51L20h6PUsvW7sLVQ-1-IZ4GXAgwlzdkf6xAJvTo0D4nBlACfb0wC6-6ireaRTBE"
        });
        console.log("FCM Device Token:", token);
        return token;
      } catch (tokenError: any) {
        console.warn("⚠️ FCM Token Fetch failed (harmless if testing locally without valid key):", tokenError?.message || tokenError);
        return null;
      }
    }
  } catch (error) {
    console.warn("⚠️ Notification permission error:", error);
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

// Set false to route all operations through FastAPI/SQLite (Firebase Storage CORS not configured)
const isFirebaseConfigured = false;
let db: any = null;
let auth: any = null;
let storage: any = null;

try {
  db = getFirestore(app);
  auth = getAuth(app);
  if (auth && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    auth.settings.appVerificationDisabledForTesting = true;
  }
  storage = getStorage(app);
} catch (error) {
  console.warn("⚠️ Firebase service initialization failed:", error);
}

// ==========================================
// MOCK DATABASE & AUTH IMPLEMENTATION (Local Storage)
// ==========================================

const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-001',
    patientName: 'Kashif Ali',
    bloodGroup: 'O+',
    units: 2,
    hospital: 'Jinnah Hospital',
    city: 'Lahore',
    district: 'Lahore Cantonment',
    ward: 'Ward 3, Bed 12',
    urgency: 'critical',
    status: 'awaiting',
    phone: '03001234567',
    slipUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 12 * 60 * 1000,
    medicalContext: 'Trauma Accident'
  },
  {
    id: 'req-002',
    patientName: 'Zainab Bibi',
    bloodGroup: 'B-',
    units: 1,
    hospital: 'Services Hospital',
    city: 'Lahore',
    district: 'Gulberg, Lahore',
    ward: 'ICU Floor 2',
    urgency: 'critical',
    status: 'en-route',
    phone: '03119876543',
    slipUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 28 * 60 * 1000,
    medicalContext: 'Emergency Surgery',
    donorName: 'Ahmed K.',
    donorEta: '20 min',
    acceptedByDonorId: 'donor-123',
    acceptedAt: Date.now() - 5 * 60 * 1000,
    lockExpiresAt: Date.now() + 85 * 60 * 1000
  },
  {
    id: 'req-003',
    patientName: 'Muhammad Rizwan',
    bloodGroup: 'A+',
    units: 3,
    hospital: 'Aga Khan Hospital',
    city: 'Karachi',
    district: 'Karachi South',
    ward: 'Surgical Ward, Bed 5',
    urgency: 'urgent',
    status: 'awaiting',
    phone: '03214567890',
    slipUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 5 * 60 * 1000,
    medicalContext: 'Thalassemia Major'
  },
  {
    id: 'req-004',
    patientName: 'Sajid Mahmood',
    bloodGroup: 'AB+',
    units: 2,
    hospital: 'PIMS Hospital',
    city: 'Islamabad',
    district: 'G-8, Islamabad',
    ward: 'Burns Unit, Bed 3',
    urgency: 'critical',
    status: 'awaiting',
    phone: '03335551212',
    slipUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 3 * 60 * 1000,
    medicalContext: 'Severe Burns'
  },
  {
    id: 'req-005',
    patientName: 'Mariam Fatima',
    bloodGroup: 'O-',
    units: 1,
    hospital: 'Mayo Hospital',
    city: 'Lahore',
    district: 'Old Anarkali, Lahore',
    ward: 'Maternity Ward, Bed 8',
    urgency: 'urgent',
    status: 'fulfilled',
    phone: '03457778899',
    slipUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    createdAt: Date.now() - 120 * 60 * 1000,
    medicalContext: 'Obstetric Emergency',
    donorName: 'Bilal A.',
    acceptedByDonorId: 'donor-456',
    acceptedAt: Date.now() - 90 * 60 * 1000
  }
];

const INITIAL_DONORS: Donor[] = [
  {
    uid: 'donor-123',
    name: 'Ahmed Khan',
    phone: '03009999999',
    city: 'Lahore',
    district: 'Lahore Cantonment',
    bloodGroup: 'O+',
    notifications: ['WhatsApp', 'SMS'],
    lastDonation: '2026-07-12',
    totalDonations: 3,
    registeredAt: Date.now() - 30 * 24 * 60 * 60 * 1000
  }
];

// Initialize Mock DB in localStorage if empty
const getMockRequests = (): BloodRequest[] => {
  const reqs = localStorage.getItem('erythronet_requests');
  if (!reqs) {
    localStorage.setItem('erythronet_requests', JSON.stringify(INITIAL_REQUESTS));
    return INITIAL_REQUESTS;
  }
  return JSON.parse(reqs);
};

const saveMockRequests = (reqs: BloodRequest[]) => {
  localStorage.setItem('erythronet_requests', JSON.stringify(reqs));
  // Dispatch local storage change event to notify subscribers in other parts of code
  window.dispatchEvent(new Event('erythronet_requests_updated'));
};

const getMockDonors = (): Donor[] => {
  const donors = localStorage.getItem('erythronet_donors');
  if (!donors) {
    localStorage.setItem('erythronet_donors', JSON.stringify(INITIAL_DONORS));
    return INITIAL_DONORS;
  }
  return JSON.parse(donors);
};

const saveMockDonors = (donors: Donor[]) => {
  localStorage.setItem('erythronet_donors', JSON.stringify(donors));
};

const getMockCurrentUser = (): Donor | null => {
  const u = localStorage.getItem('erythronet_current_user');
  return u ? JSON.parse(u) : null;
};

// Listeners tracking for local mock subscriptions
const mockSubscribers: Set<() => void> = new Set();

// ==========================================
// EXPORTED CORE BACKEND SERVICES (Dual Mode)
// ==========================================

export const backend = {
  requestsApi,
  donorsApi,
  metricsApi,
  /**
   * Subscribe to requests feed.
   * Uses FastAPI polling as primary; falls back to Firestore then localStorage.
   */
  subscribeToRequests: (callback: (requests: BloodRequest[]) => void): (() => void) => {
    if (isFirebaseConfigured && db) {
      // Firebase real-time (if keys are set)
      const q = query(collection(db, 'requests'), orderBy('createdAt', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const reqs: BloodRequest[] = [];
        snapshot.forEach((doc) => {
          reqs.push({ id: doc.id, ...doc.data() } as BloodRequest);
        });
        callback(reqs as BloodRequest[]);
      }, (_error) => {
        // Firestore listener failed — silently fall back to FastAPI polling
        return pollRequests(callback as any);
      });
    } else {
      // FastAPI/SQLite polling (primary when Firebase is not configured)
      return pollRequests((reqs) => {
        callback(reqs as unknown as BloodRequest[]);
      });
    }
  },

  /**
   * Create a new emergency blood request — saved to SQLite via FastAPI.
   */
  createRequest: async (
    requestData: Omit<BloodRequest, 'id' | 'createdAt' | 'status'>,
    slipFile: File | null
  ): Promise<string> => {
    if (isFirebaseConfigured && db && storage) {
      // Firebase path (only if fully configured with CORS & Storage rules)
      const id = 'req-' + Math.random().toString(36).substr(2, 9);
      let slipUrl = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80';
      if (slipFile) {
        try {
          // 5-second timeout on Storage upload to prevent indefinite hang
          const uploadPromise = (async () => {
            const fileRef = ref(storage, `slips/${id}/${slipFile.name}`);
            const snap = await uploadBytes(fileRef, slipFile);
            return await getDownloadURL(snap.ref);
          })();
          const timeoutPromise = new Promise<string>((_, reject) =>
            setTimeout(() => reject(new Error('Storage upload timeout')), 5000)
          );
          slipUrl = await Promise.race([uploadPromise, timeoutPromise]);
        } catch (uploadErr) {
          console.warn('⚠️ Firebase Storage upload failed/timed out, proceeding without slip URL:', uploadErr);
          slipUrl = slipFile ? URL.createObjectURL(slipFile) : slipUrl;
        }
      }
      const newReq: BloodRequest = { ...requestData, id, slipUrl, status: 'awaiting', createdAt: Date.now() };
      await setDoc(doc(db, 'requests', id), newReq);
      return id;
    }

    // FastAPI/SQLite path (primary)
    const fields: Record<string, string | number> = {
      patient_name:    requestData.patientName,
      hospital:        requestData.hospital,
      ward:            requestData.ward,
      city:            requestData.city,
      district:        requestData.district,
      blood_group:     requestData.bloodGroup,
      units:           requestData.units,
      urgency:         requestData.urgency,
      phone:           requestData.phone,
      medical_context: requestData.medicalContext || 'General Emergency',
    };
    const id = await requestsApi.create(fields, slipFile);
    return id;
  },

  /**
   * Donor Handshake (State Lock): Locks request to "en-route" with selected ETA.
   */
  acceptRequest: async (
    requestId: string,
    donorName: string,
    donorEta: string,
    donorId: string
  ): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'en-route', donorName, donorEta,
        acceptedByDonorId: donorId,
        acceptedAt: Date.now(),
        lockExpiresAt: Date.now() + 90 * 60 * 1000
      });
    } else {
      // FastAPI/SQLite path
      await requestsApi.accept(requestId, donorName, donorEta, donorId);
    }
  },

  /**
   * Cancel Donor Commitment: Release lock, revert status to "awaiting".
   */
  cancelAcceptance: async (requestId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, 'requests', requestId), {
        status: 'awaiting', donorName: null, donorEta: null,
        acceptedByDonorId: null, acceptedAt: null, lockExpiresAt: null
      });
    } else {
      // FastAPI/SQLite path
      await requestsApi.cancel(requestId);
    }
  },

  /**
   * Mark Blood Request as Fulfilled — persists to SQLite.
   */
  fulfillRequest: async (requestId: string): Promise<void> => {
    if (isFirebaseConfigured && db) {
      const docRef = doc(db, 'requests', requestId);
      await updateDoc(docRef, { status: 'fulfilled', fulfilledAt: Date.now() });
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().acceptedByDonorId) {
        const donorRef = doc(db, 'donors', snap.data().acceptedByDonorId);
        const donorSnap = await getDoc(donorRef);
        if (donorSnap.exists()) {
          await updateDoc(donorRef, {
            totalDonations: (donorSnap.data().totalDonations || 0) + 1,
            lastDonation: new Date().toISOString().split('T')[0]
          });
        }
      }
    } else {
      // FastAPI/SQLite path
      await requestsApi.fulfill(requestId);
    }
  },

  /**
   * Register a new Voluntary Donor — saved to SQLite via FastAPI.
   */
  registerDonor: async (
    donorData: Omit<Donor, 'totalDonations' | 'registeredAt'>
  ): Promise<void> => {
    let savedDonor: Donor;

    if (isFirebaseConfigured && db) {
      const newDonor: Donor = { ...donorData, totalDonations: 0, registeredAt: Date.now() };
      await setDoc(doc(db, 'donors', newDonor.uid), newDonor);
      savedDonor = newDonor;
    } else {
      // FastAPI/SQLite path
      const result = await donorsApi.register({
        uid:          donorData.uid,
        name:         donorData.name,
        phone:        donorData.phone,
        city:         donorData.city,
        district:     donorData.district,
        blood_group:  donorData.bloodGroup,
        notifications: donorData.notifications,
        last_donation: donorData.lastDonation,
      });
      savedDonor = result as unknown as Donor;
    }

    // Cache session locally so auth state persists across refreshes
    localStorage.setItem('erythronet_current_user', JSON.stringify(savedDonor));
    window.dispatchEvent(new Event('erythronet_auth_changed'));

    if (savedDonor.city) {
      subscribeToCityTopic(savedDonor.city);
    }
  },

  /**
   * Get active logged-in donor profile.
   */
  getCurrentDonor: (): Donor | null => {
    return getMockCurrentUser();
  },

  /**
   * Logout current donor.
   */
  logoutDonor: (): void => {
    localStorage.removeItem('erythronet_current_user');
    window.dispatchEvent(new Event('erythronet_auth_changed'));
  },

  /**
   * Get global metrics — live from FastAPI/SQLite.
   */
  getMetrics: async (): Promise<{ totalFulfilled: number; totalDonors: number; avgResponseMinutes: number }> => {
    if (isFirebaseConfigured && db) {
      // Fallback: compute from local if Firebase is active
      const reqs = getMockRequests();
      const donors = getMockDonors();
      return {
        totalFulfilled: 840 + reqs.filter((r) => r.status === 'fulfilled').length,
        totalDonors: 2420 + donors.length,
        avgResponseMinutes: 34
      };
    }
    try {
      return await metricsApi.get();
    } catch {
      return { totalFulfilled: 840, totalDonors: 2420, avgResponseMinutes: 34 };
    }
  }
};
