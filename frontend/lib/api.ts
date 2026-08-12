/**
 * ErythroNet API Client
 * Connects the frontend to the FastAPI/SQLite backend at http://localhost:8000
 * All data is now persisted in erythronet.db (SQLite) via FastAPI.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || `API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Map snake_case API response fields to camelCase frontend types
function mapRequest(r: any) {
  return {
    id:                 r.id,
    patientName:        r.patient_name,
    bloodGroup:         r.blood_group,
    units:              r.units,
    hospital:           r.hospital,
    ward:               r.ward,
    city:               r.city,
    district:           r.district,
    urgency:            r.urgency,
    status:             r.status,
    phone:              r.phone,
    medicalContext:     r.medical_context,
    slipUrl:            r.slip_url,
    createdAt:          r.created_at * 1000,   // API returns seconds, frontend uses ms
    donorName:          r.donor_name,
    donorEta:           r.donor_eta,
    acceptedByDonorId:  r.accepted_by_donor_id,
    acceptedAt:         r.accepted_at ? r.accepted_at * 1000 : undefined,
    lockExpiresAt:      r.lock_expires_at ? r.lock_expires_at * 1000 : undefined,
  };
}

function mapDonor(d: any) {
  return {
    uid:            d.uid,
    name:           d.name,
    phone:          d.phone,
    city:           d.city,
    district:       d.district,
    bloodGroup:     d.blood_group,
    notifications:  d.notifications ?? [],
    lastDonation:   d.last_donation,
    totalDonations: d.total_donations,
    registeredAt:   d.registered_at * 1000,
  };
}

// ─── Requests API ────────────────────────────────────────────────────────────

export const requestsApi = {
  /** Fetch all blood requests (with optional filters) */
  getAll: async (params?: { city?: string; blood_group?: string; status?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    const data = await apiFetch<any[]>(`/api/requests/${qs ? `?${qs}` : ''}`);
    return data.map(mapRequest);
  },

  /** Get a single request by id */
  getById: async (id: string) => {
    const data = await apiFetch<any>(`/api/requests/${id}`);
    return mapRequest(data);
  },

  /** Create a new emergency request (multipart/form-data for file upload) */
  create: async (fields: Record<string, string | number>, slipFile: File | null): Promise<string> => {
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, String(v)));
    if (slipFile) form.append('slip_file', slipFile);

    const res = await fetch(`${BASE_URL}/api/requests/`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || `API error ${res.status}`);
    }
    const data = await res.json();
    return data.id;
  },

  /** Accept a request as a donor */
  accept: async (id: string, donorName: string, donorEta: string, donorId: string) => {
    await apiFetch(`/api/requests/${id}/accept`, {
      method: 'POST',
      body: JSON.stringify({ donor_name: donorName, donor_eta: donorEta, donor_id: donorId }),
    });
  },

  /** Cancel an en-route lock */
  cancel: async (id: string) => {
    await apiFetch(`/api/requests/${id}/cancel`, { method: 'POST' });
  },

  /** Fulfill a request */
  fulfill: async (id: string) => {
    await apiFetch(`/api/requests/${id}/fulfill`, { method: 'POST' });
  },
};

// ─── Donors API ──────────────────────────────────────────────────────────────

export const donorsApi = {
  /** Register a new donor */
  register: async (donor: {
    uid: string; name: string; phone: string; city: string;
    district: string; blood_group: string; notifications: string[]; last_donation?: string;
  }) => {
    const data = await apiFetch<any>('/api/donors/', {
      method: 'POST',
      body: JSON.stringify(donor),
    });
    return mapDonor(data);
  },

  /** Get donor profile by uid */
  getById: async (uid: string) => {
    const data = await apiFetch<any>(`/api/donors/${uid}`);
    return mapDonor(data);
  },

  /** Login by phone number */
  login: async (phone: string) => {
    const data = await apiFetch<any>('/api/donors/login', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return mapDonor(data);
  },
};

// ─── Metrics API ─────────────────────────────────────────────────────────────

export const metricsApi = {
  get: async () => {
    const data = await apiFetch<any>('/api/metrics/');
    return {
      totalFulfilled:     data.total_fulfilled,
      totalDonors:        data.total_donors,
      avgResponseMinutes: data.avg_response_minutes,
    };
  },
};

// ─── Polling helper (replaces Firestore real-time for requests feed) ──────────

/**
 * Poll the backend for requests every intervalMs milliseconds.
 * Returns an unsubscribe function, mimicking the Firebase onSnapshot API.
 */
export function pollRequests(
  callback: (requests: ReturnType<typeof mapRequest>[]) => void,
  intervalMs = 5000,
): () => void {
  let active = true;

  const fetch_ = async () => {
    try {
      const data = await requestsApi.getAll();
      if (active) callback(data);
    } catch (e) {
      console.error('[ErythroNet] Polling error:', e);
    }
  };

  fetch_(); // immediate first call
  const timer = setInterval(fetch_, intervalMs);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
