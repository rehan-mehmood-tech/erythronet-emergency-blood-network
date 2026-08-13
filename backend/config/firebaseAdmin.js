import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;

try {
  // Service account is in backend/serviceAccountKey.json, and this file is in backend/config/
  const saPath = path.resolve(__dirname, '../serviceAccountKey.json');
  if (fs.existsSync(saPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(saPath, 'utf8'));
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id || 'erythronet-emergency-blood-net'
    });
    console.log("Firebase Admin initialized successfully with serviceAccountKey.json");
  } else {
    // Graceful fallback to Application Default Credentials
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: 'erythronet-emergency-blood-net'
    });
    console.log("Firebase Admin initialized successfully with Application Default Credentials");
  }
  db = admin.firestore();
  console.log("[Firebase Admin] Firestore client ready ✓");
} catch (error) {
  console.error("Firebase Admin initialization warning: fallback to environment or default", error);
  try {
    admin.initializeApp({
      projectId: 'erythronet-emergency-blood-net'
    });
    db = admin.firestore();
    console.log("Firebase Admin initialized successfully with default Project ID");
  } catch (innerError) {
    console.error("Fatal: Failed to initialize Firebase Admin SDK:", innerError);
  }
}

export { db };
