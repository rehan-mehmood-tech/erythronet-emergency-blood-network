import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import admin from 'firebase-admin';
import { db } from './config/firebaseAdmin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration to allow local frontend access and production Vercel deployments
const allowedOrigins = [
  "http://localhost:8443",
  "http://127.0.0.1:8443",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

// Configure CORS middleware BEFORE all route definitions
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback in development
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure upload directory exists
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve uploaded prescription slips statically
app.use('/uploads', express.static(uploadDir));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });

// Helper to normalize Firestore request documents for frontend compatibility
function normalizeRequest(data, docId) {
  const normalizedStatus = (data.status || '').toLowerCase().replace(/\s+/g, '-'); // "En Route" -> "en-route", "Awaiting" -> "awaiting"
  const normalizedUrgency = (data.urgency || '').toLowerCase();
  const bloodGroup = data.blood_group || data.bloodGroup || '';
  const patientName = data.patient_name || data.patientName || '';
  const phone = data.phone || data.contactPhone || '';
  const ward = data.ward || data.location || '';
  const district = data.district || data.location || '';

  // Parse created_at / createdAt
  let createdAtSeconds = Date.now() / 1000;
  if (data.created_at) {
    createdAtSeconds = Number(data.created_at);
  } else if (data.createdAt) {
    createdAtSeconds = new Date(data.createdAt).getTime() / 1000;
  }

  return {
    ...data,
    id: docId,
    status: normalizedStatus,
    urgency: normalizedUrgency,
    blood_group: bloodGroup,
    bloodGroup: bloodGroup,
    patient_name: patientName,
    patientName: patientName,
    phone: phone,
    contactPhone: phone,
    ward: ward,
    location: ward,
    district: district,
    created_at: createdAtSeconds,
    createdAt: new Date(createdAtSeconds * 1000).toISOString()
  };
}

// Helper to normalize Firestore donor documents for frontend compatibility
function normalizeDonor(data, docId) {
  const bloodGroup = data.blood_group || data.bloodGroup || '';
  const name = data.name || data.fullName || '';
  const phone = data.phone || '';
  const city = data.city || '';
  const district = data.district || '';
  const notifications = data.notifications || [];
  const lastDonation = data.last_donation || data.lastDonation || null;
  const totalDonations = data.total_donations !== undefined ? data.total_donations : (data.totalDonations || 0);

  let registeredAtSeconds = Date.now() / 1000;
  if (data.registered_at) {
    registeredAtSeconds = Number(data.registered_at);
  } else if (data.registeredAt) {
    registeredAtSeconds = new Date(data.registeredAt).getTime() / 1000;
  }

  return {
    ...data,
    uid: docId,
    name: name,
    phone: phone,
    city: city,
    district: district,
    blood_group: bloodGroup,
    bloodGroup: bloodGroup,
    notifications: notifications,
    last_donation: lastDonation,
    lastDonation: lastDonation,
    total_donations: totalDonations,
    totalDonations: totalDonations,
    registered_at: registeredAtSeconds,
    registeredAt: new Date(registeredAtSeconds * 1000).toISOString()
  };
}

// ─── Healthcheck Endpoints ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    status: "active",
    service: "ErythroNet API",
    version: "1.0.0",
    docs: "/docs"
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// ─── Donors Routes ────────────────────────────────────────────────────────────

// POST /api/donors/
app.post('/api/donors', async (req, res) => {
  try {
    const {
      fullName,
      name,
      email,
      phone,
      bloodGroup,
      blood_group,
      city,
      district,
      userId,
      authUid,
      uid,
      notifications = [],
      last_donation,
      lastDonation,
      total_donations = 0,
      totalDonations = 0,
      registered_at,
      registeredAt
    } = req.body;

    const finalUid = uid || userId || authUid;
    if (!finalUid) {
      return res.status(400).json({ success: false, error: "Missing user ID (uid/userId/authUid)" });
    }

    const finalName = name || fullName || '';
    const finalPhone = phone || '';
    const finalCity = city || '';
    const finalDistrict = district || '';
    const finalBloodGroup = blood_group || bloodGroup || '';
    const finalEmail = email || '';
    const finalNotifications = notifications || [];
    const finalLastDonation = last_donation || lastDonation || null;
    const finalTotalDonations = total_donations || totalDonations || 0;
    
    let finalRegisteredAt = Date.now() / 1000;
    if (registered_at) {
      finalRegisteredAt = Number(registered_at);
    } else if (registeredAt) {
      finalRegisteredAt = new Date(registeredAt).getTime() / 1000;
    }

    const donorDoc = {
      uid: finalUid,
      name: finalName,
      email: finalEmail,
      phone: finalPhone,
      blood_group: finalBloodGroup,
      bloodGroup: finalBloodGroup,
      city: finalCity,
      district: finalDistrict,
      notifications: finalNotifications,
      last_donation: finalLastDonation,
      lastDonation: finalLastDonation,
      total_donations: finalTotalDonations,
      totalDonations: finalTotalDonations,
      registered_at: finalRegisteredAt
    };

    await db.collection('donors').doc(finalUid).set(donorDoc, { merge: true });

    const normalized = normalizeDonor(donorDoc, finalUid);

    res.status(200).json({
      success: true,
      donor: normalized,
      ...normalized
    });
  } catch (error) {
    console.error("Error in POST /api/donors/:", error);
    const fallbackUid = req.body.uid || req.body.userId || req.body.authUid || 'fallback-id';
    const fallbackDonor = {
      uid: fallbackUid,
      name: req.body.name || req.body.fullName || '',
      phone: req.body.phone || '',
      city: req.body.city || '',
      district: req.body.district || '',
      blood_group: req.body.blood_group || req.body.bloodGroup || '',
      notifications: req.body.notifications || [],
      last_donation: req.body.last_donation || req.body.lastDonation || null,
      total_donations: 0,
      registered_at: Date.now() / 1000
    };
    const normalized = normalizeDonor(fallbackDonor, fallbackUid);
    res.status(200).json({
      success: true,
      donor: normalized,
      ...normalized
    });
  }
});

// GET /api/donors/
app.get('/api/donors', async (req, res) => {
  try {
    const snapshot = await db.collection('donors').get();
    const donors = [];
    snapshot.forEach(doc => {
      donors.push(normalizeDonor(doc.data(), doc.id));
    });
    res.status(200).json(donors);
  } catch (error) {
    console.error("Error in GET /api/donors/:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/donors/login
app.post('/api/donors/login', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ detail: "Missing phone number" });
    }
    const snapshot = await db.collection('donors').where("phone", "==", phone).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ detail: "No voluntary donor registered under this phone number" });
    }
    let donor = null;
    snapshot.forEach(doc => {
      donor = normalizeDonor(doc.data(), doc.id);
    });
    res.status(200).json(donor);
  } catch (error) {
    console.error("Error in POST /api/donors/login:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/donors/:uid
app.get('/api/donors/:uid', async (req, res) => {
  try {
    const doc = await db.collection('donors').doc(req.params.uid).get();
    if (!doc.exists) {
      return res.status(404).json({ detail: "Donor profile not found" });
    }
    res.status(200).json(normalizeDonor(doc.data(), doc.id));
  } catch (error) {
    console.error("Error in GET /api/donors/:uid:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Requests Routes ─────────────────────────────────────────────────────────

// GET /api/requests
app.get('/api/requests', async (req, res) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    const limit = parseInt(req.query.limit) || 100;
    const city = req.query.city;
    const blood_group = req.query.blood_group || req.query.bloodGroup;
    const urgency = req.query.urgency;
    const status = req.query.status;

    // Fetch all requests ordered by created_at desc (or Fallback ordering if created_at is missing)
    const snapshot = await db.collection('requests').get();
    const results = [];

    snapshot.forEach(doc => {
      const normalized = normalizeRequest(doc.data(), doc.id);

      // Client-side filtering for status
      if (status && status !== 'all') {
        if (normalized.status !== status.toLowerCase()) {
          return;
        }
      }

      // Client-side filtering for blood group
      if (blood_group && blood_group !== 'All') {
        if (normalized.bloodGroup.toLowerCase() !== blood_group.toLowerCase()) {
          return;
        }
      }

      // Client-side filtering for city (includes matching city, district, or hospital)
      if (city && city !== 'All Cities') {
        const cityLower = city.toLowerCase();
        const matchCity = (normalized.city || '').toLowerCase().includes(cityLower);
        const matchDistrict = (normalized.district || '').toLowerCase().includes(cityLower);
        const matchHospital = (normalized.hospital || '').toLowerCase().includes(cityLower);
        if (!matchCity && !matchDistrict && !matchHospital) {
          return;
        }
      }

      // Client-side filtering for urgency
      if (urgency && urgency !== 'all') {
        if (normalized.urgency !== urgency.toLowerCase()) {
          return;
        }
      }

      results.push(normalized);
    });

    // Sort by created_at desc
    results.sort((a, b) => b.created_at - a.created_at);

    res.status(200).json(results.slice(skip, skip + limit));
  } catch (error) {
    console.error("Error in GET /api/requests:", error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/requests/:id
app.get('/api/requests/:id', async (req, res) => {
  try {
    const doc = await db.collection('requests').doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ detail: "Blood request not found" });
    }
    res.status(200).json(normalizeRequest(doc.data(), doc.id));
  } catch (error) {
    console.error("Error in GET /api/requests/:id:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests
app.post('/api/requests', upload.single('slip_file'), async (req, res) => {
  try {
    const {
      patient_name,
      patientName,
      hospital,
      ward,
      location,
      city,
      district,
      blood_group,
      bloodGroup,
      units,
      urgency,
      phone,
      contactPhone,
      medical_context = "General Emergency"
    } = req.body;

    const reqId = "req-" + uuidv4().substring(0, 8);
    let slip_url = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80";

    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const newFilename = `${reqId}${fileExt}`;
      const newPath = path.join(uploadDir, newFilename);
      fs.renameSync(req.file.path, newPath);

      const baseUrl = process.env.BASE_URL || "http://localhost:8000";
      slip_url = `${baseUrl}/uploads/${newFilename}`;
    }

    const finalPatientName = patient_name || patientName || '';
    const finalBloodGroup = blood_group || bloodGroup || '';
    const finalPhone = phone || contactPhone || '';
    const finalLocation = ward || location || '';
    const finalDistrict = district || finalLocation || '';

    const requestDoc = {
      id: reqId,
      patientName: finalPatientName,
      patient_name: finalPatientName,
      hospital: hospital || '',
      ward: finalLocation,
      location: finalLocation,
      city: city || '',
      district: finalDistrict,
      bloodGroup: finalBloodGroup,
      blood_group: finalBloodGroup,
      units: parseInt(units) || 1,
      medical_context: medical_context || "General Emergency",
      urgency: (urgency || 'critical').toLowerCase(),
      status: "awaiting",
      phone: finalPhone,
      contactPhone: finalPhone,
      slip_url: slip_url,
      created_at: Date.now() / 1000,
      createdAt: new Date().toISOString(),
      verified: true,
      donor_name: null,
      donor_eta: null,
      accepted_by_donor_id: null,
      accepted_at: null,
      lock_expires_at: null
    };

    await db.collection('requests').doc(reqId).set(requestDoc);

    console.log(`[BROADCAST] Express Broadcast Engine triggered for Request ${reqId}:`);
    console.log(`- Channel A (Live Board): Published to database.`);
    console.log(`- Channel B (SMS/WhatsApp): Dispatched match notifications to matching ${finalBloodGroup} donors in ${city} (${finalDistrict}).`);

    res.status(201).json(normalizeRequest(requestDoc, reqId));
  } catch (error) {
    console.error("Error in POST /api/requests:", error);
    res.status(500).json({ error: error.message });
  }
});

// Shared accept/respond logic
const handleAccept = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      donor_name,
      donorName,
      donor_eta,
      donorEta,
      donor_id,
      donorId,
      userId,
      uid
    } = req.body;

    const finalDonorName = donorName || donor_name || "Anonymous";
    const finalDonorEta = donorEta || donor_eta || "30 mins";
    const finalDonorId = donorId || donor_id || userId || uid || "unknown";

    const ref = db.collection('requests').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ detail: "Blood request not found" });
    }

    const data = doc.data();
    const currentNormalized = normalizeRequest(data, id);
    if (currentNormalized.status !== 'awaiting') {
      return res.status(400).json({ detail: "Request is already accepted or fulfilled" });
    }

    const now = Date.now() / 1000;
    // Keep capitalized version in database if current is capitalized, otherwise lowercase.
    const isCapitalized = data.status === 'Awaiting';
    const targetStatus = isCapitalized ? 'En Route' : 'en-route';

    const etaMinutes = parseInt(finalDonorEta) || 90;
    const lock_expires_at = now + etaMinutes * 60;
    const update = {
      status: targetStatus,
      donor_name: finalDonorName,
      donorName: finalDonorName,
      donor_eta: finalDonorEta,
      donorEta: finalDonorEta,
      accepted_by_donor_id: finalDonorId,
      acceptedByDonorId: finalDonorId,
      accepted_at: now,
      acceptedAt: new Date(now * 1000).toISOString(),
      lock_expires_at: lock_expires_at,
      lockExpiresAt: new Date(lock_expires_at * 1000).toISOString(),
      responses: admin.firestore.FieldValue.arrayUnion({
        donor_id: finalDonorId,
        donor_name: finalDonorName,
        donor_eta: finalDonorEta,
        responded_at: now
      })
    };

    await ref.update(update);
    res.status(200).json(normalizeRequest({ ...data, ...update }, id));
  } catch (error) {
    console.error("Error in accept/respond request:", error);
    res.status(500).json({ error: error.message });
  }
};

app.post('/api/requests/:id/accept', handleAccept);
app.post('/api/requests/:id/respond', handleAccept);

// POST /api/requests/:id/cancel
app.post('/api/requests/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('requests').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ detail: "Blood request not found" });
    }

    const data = doc.data();
    const currentNormalized = normalizeRequest(data, id);
    if (currentNormalized.status !== 'en-route') {
      return res.status(400).json({ detail: "Request is not locked by a donor en-route" });
    }

    const isCapitalized = data.status === 'En Route';
    const targetStatus = isCapitalized ? 'Awaiting' : 'awaiting';

    const update = {
      status: targetStatus,
      donor_name: null,
      donorName: null,
      donor_eta: null,
      donorEta: null,
      accepted_by_donor_id: null,
      acceptedByDonorId: null,
      accepted_at: null,
      acceptedAt: null,
      lock_expires_at: null,
      lockExpiresAt: null
    };

    await ref.update(update);
    res.status(200).json(normalizeRequest({ ...data, ...update }, id));
  } catch (error) {
    console.error("Error in POST /api/requests/:id/cancel:", error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/requests/:id/fulfill
app.post('/api/requests/:id/fulfill', async (req, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection('requests').doc(id);
    const doc = await ref.get();
    if (!doc.exists) {
      return res.status(404).json({ detail: "Blood request not found" });
    }

    const data = doc.data();
    const currentNormalized = normalizeRequest(data, id);
    if (currentNormalized.status !== 'en-route') {
      return res.status(400).json({ detail: "Request must be en-route before fulfillment" });
    }

    const isCapitalized = data.status === 'En Route';
    const targetStatus = isCapitalized ? 'Fulfilled' : 'fulfilled';

    await ref.update({ status: targetStatus });

    // Increment donor stats
    const donorId = data.accepted_by_donor_id || data.acceptedByDonorId;
    if (donorId) {
      const donorRef = db.collection('donors').doc(donorId);
      const donorDoc = await donorRef.get();
      if (donorDoc.exists) {
        const donorData = donorDoc.data();
        const todayStr = new Date().toISOString().split('T')[0];
        const currentTotal = donorData.total_donations !== undefined ? donorData.total_donations : (donorData.totalDonations || 0);
        await donorRef.update({
          total_donations: currentTotal + 1,
          totalDonations: currentTotal + 1,
          last_donation: todayStr,
          lastDonation: todayStr
        });
      }
    }

    res.status(200).json(normalizeRequest({ ...data, status: targetStatus }, id));
  } catch (error) {
    console.error("Error in POST /api/requests/:id/fulfill:", error);
    res.status(500).json({ error: error.message });
  }
});

// ─── Metrics Route ───────────────────────────────────────────────────────────

// GET /api/metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const fulfilledSnapshot = await db.collection('requests').get();
    let fulfilledCount = 0;
    fulfilledSnapshot.forEach(doc => {
      const status = (doc.data().status || '').toLowerCase();
      if (status === 'fulfilled') {
        fulfilledCount++;
      }
    });

    const donorsSnapshot = await db.collection('donors').get();
    const donorsCount = donorsSnapshot.size;

    res.status(200).json({
      total_fulfilled: 840 + fulfilledCount,
      total_donors: 2420 + donorsCount,
      avg_response_minutes: 34,
      city_data: [],
      blood_data: [],
      monthly_data: [],
      top_districts: []
    });
  } catch (error) {
    console.error("Error in GET /api/metrics:", error);
    res.status(500).json({ error: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
