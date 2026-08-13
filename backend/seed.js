import { db } from './config/firebaseAdmin.js';
import { v4 as uuidv4 } from 'uuid';

const cities = ["Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad"];
const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const urgencies = ["Critical", "Urgent", "Routine"];
const statuses = ["Awaiting", "En Route", "Fulfilled"];

const hospitalMap = {
  "Lahore": ["Jinnah Hospital", "Mayo Hospital", "Services Hospital", "Doctors Hospital", "Shaukat Khanum"],
  "Karachi": ["Aga Khan University Hospital", "NICVD Karachi", "Civil Hospital Karachi", "Liaquat National", "Indus Hospital"],
  "Islamabad": ["PIMS Islamabad", "Shifa International", "Maroof International", "Polyclinic", "Kulsum International"],
  "Rawalpindi": ["Rawalpindi General Hospital", "Holy Family Hospital", "Benazir Bhutto Hospital", "Fauji Foundation", "District Headquarters Hospital"],
  "Faisalabad": ["Allied Hospital Faisalabad", "Faisalabad Institute of Cardiology", "DHQ Hospital Faisalabad", "Mian Trust Hospital", "Mujahid Hospital"]
};

const patientNames = [
  "Ali Raza", "Usman Khan", "Fatima Bibi", "Muhammad Rizwan", "Zainab Bibi",
  "Sajid Mahmood", "Ayesha Begum", "Bilal Ahmed", "Mariam Fatima", "Kashif Ali",
  "Kamran Shah", "Noreen Akhter", "Yasir Arafat", "Saima Khan", "Tariq Jamil",
  "Nida Dar", "Babar Azam", "Shaheen Afridi", "Haris Rauf", "Shadab Khan",
  "Naseem Shah", "Mohammad Amir", "Fakhar Zaman", "Imam-ul-Haq", "Sarfaraz Ahmed",
  "Shoaib Malik", "Sania Mirza", "Waseem Akram", "Javed Miandad", "Inzamam-ul-Haq",
  "Younis Khan", "Misbah-ul-Haq", "Abdur Rehman", "Saeed Ajmal", "Yasir Shah",
  "Azhar Ali", "Asad Shafiq", "Shan Masood", "Abid Ali", "Nauman Ali",
  "Sajid Khan", "Zahid Mahmood", "Mohammad Nawaz", "Imad Wasim", "Faheem Ashraf",
  "Hasan Ali", "Haris Sohail", "Asif Ali", "Khushdil Shah", "Iftikhar Ahmed"
];

const wards = [
  "Emergency Ward 2", "ICU Bed 4", "Surgical Unit 3", "Maternity Ward 1", 
  "CCU Bed 2", "Cardiac Care Unit", "Trauma Center Bed 12", "Surgical ICU Room 3",
  "Private Ward 4", "General Ward Room 2", "Burns Ward Bed 6", "Paediatric Unit Bed 5"
];

const phonePrefixes = ["+92 300", "+92 311", "+92 321", "+92 333", "+92 345", "+92 301", "+92 312", "+92 322", "+92 334", "+92 346"];

const requests = [];
for (let i = 0; i < 50; i++) {
  const city = cities[i % cities.length];
  const bloodGroup = bloodGroups[i % bloodGroups.length];
  const urgency = urgencies[i % urgencies.length];
  const status = statuses[i % statuses.length];
  
  const hospitals = hospitalMap[city];
  const hospital = hospitals[i % hospitals.length];
  const location = wards[i % wards.length];
  const patientName = patientNames[i % patientNames.length];
  const contactPhone = `${phonePrefixes[i % phonePrefixes.length]} ${Math.floor(1000000 + Math.random() * 9000000)}`;
  
  // Spread out createdAt from 10 mins ago to 48 hours ago
  const hoursAgo = (i * 48) / 50; // spreads from 0 to 48 hours
  const createdAt = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString();
  
  const req = {
    patientName,
    bloodGroup,
    city,
    hospital,
    location,
    units: Math.floor(1 + (i % 4)), // units between 1 and 4
    urgency,
    status,
    contactPhone,
    createdAt,
    verified: true
  };
  
  if (status === "En Route") {
    req.donorName = patientNames[(i + 5) % patientNames.length] + " (Donor)";
    req.donorEta = `${[15, 30, 45, 60, 90][i % 5]} min`;
    req.acceptedByDonorId = `donor-${i}`;
    req.acceptedAt = new Date(new Date(createdAt).getTime() + 5 * 60 * 1000).toISOString(); // accepted 5 mins after request
    const etaMinutes = parseInt(req.donorEta);
    req.lockExpiresAt = new Date(new Date(req.acceptedAt).getTime() + etaMinutes * 60 * 1000).toISOString();
  } else if (status === "Fulfilled") {
    req.donorName = patientNames[(i + 5) % patientNames.length] + " (Donor)";
    req.acceptedByDonorId = `donor-${i}`;
  }
  
  requests.push(req);
}

async function seed() {
  console.log("Seeding Firestore with 50 requests...");
  try {
    const colRef = db.collection('requests');

    // Clear existing requests first to avoid duplicates
    const existingDocs = await colRef.get();
    const batch = db.batch();
    let deleteCount = 0;
    existingDocs.forEach(doc => {
      batch.delete(doc.ref);
      deleteCount++;
    });
    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Cleared ${deleteCount} existing emergency requests from Firestore.`);
    }

    for (const req of requests) {
      const docId = "req-" + uuidv4().substring(0, 8);
      
      const payload = {
        // CamelCase properties as requested by seeder spec
        id: docId,
        patientName: req.patientName,
        bloodGroup: req.bloodGroup,
        city: req.city,
        hospital: req.hospital,
        location: req.location,
        units: req.units,
        urgency: req.urgency,
        status: req.status,
        contactPhone: req.contactPhone,
        createdAt: req.createdAt,
        verified: req.verified,

        // Snake_case properties for compatibility with original code & frontend API client
        patient_name: req.patientName,
        blood_group: req.bloodGroup,
        ward: req.location,
        district: `${req.location}, ${req.city}`, // district contains city for filter matching in LiveBoard.tsx
        phone: req.contactPhone,
        medical_context: "Emergency Blood Request",
        slip_url: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
        created_at: new Date(req.createdAt).getTime() / 1000,
        
        // Donor en route properties if present
        donor_name: req.donorName || null,
        donorName: req.donorName || null,
        donor_eta: req.donorEta || null,
        donorEta: req.donorEta || null,
        accepted_by_donor_id: req.acceptedByDonorId || null,
        acceptedByDonorId: req.acceptedByDonorId || null,
        accepted_at: req.acceptedAt ? new Date(req.acceptedAt).getTime() / 1000 : null,
        acceptedAt: req.acceptedAt || null,
        lock_expires_at: req.lockExpiresAt ? new Date(req.lockExpiresAt).getTime() / 1000 : null,
        lockExpiresAt: req.lockExpiresAt || null
      };

      await colRef.doc(docId).set(payload);
    }
    console.log("Successfully seeded 50 requests into Firestore!");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed database:", error);
    process.exit(1);
  }
}

seed();
