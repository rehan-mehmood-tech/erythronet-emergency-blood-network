# ErythroNet Emergency Blood Network

ErythroNet is a real-time emergency blood coordination platform built for cities in Pakistan where urgent blood requests often fail because the request is buried in WhatsApp spam, duplicate donor travel is common, and there is no trusted matching flow between donors and verified hospital requests.

The project replaces reactive message threads with a structured request board, donor verification flow, and geo-aware notification system so blood requests can be handled faster, more transparently, and with less duplication.

---

## Architecture & Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for local development and build output
- Tailwind CSS for responsive UI and interaction styling
- Browser-side request polling and city/blood filter interfaces
- Live board experience for emergency request discovery and donor actions

### Backend
- Node.js + Express
- Firebase Cloud Firestore for persistent request and donor data
- Firebase Admin SDK for FCM messaging and topic-based broadcasts
- Multer-based upload handling for hospital slips and verification documents
- In-memory request cache to keep response times low under active request load

### Notification & Matching Model
- Geo-targeted city topics such as `city_lahore`, `city_karachi`, and `city_islamabad`
- Background FCM dispatch for new urgent requests without blocking app responses
- Donor acceptance flow with en-route lock state to prevent duplicate travel to the same request
- Medical compatibility guard logic to keep donor-to-request matching transparent and cautious

---

## Key Capabilities

### 1. Geo-Targeted FCM Broadcasts
When a verified request is created, the backend publishes a topic-based push notification for the relevant city and related audience segment. This keeps urgent calls visible to nearby donors without requiring a full native mobile app.

### 2. Sub-100ms API Caching
The request board uses a short-lived in-memory cache with a 3-second TTL so repeated reads do not repeatedly hit Firestore. This reduces latency during active board refreshes while preserving fresh data after the cache window expires.

### 3. Medical Compatibility Guard
The platform surfaces a compatibility-aware donor flow so users can verify blood compatibility and request urgency before confirming a response. The request board is structured around trust, speed, and status transparency rather than uncontrolled broadcast chaos.

---

## Repository Layout

```text
.
├── backend/                  # Express API, Firestore access, FCM dispatch, uploads
├── frontend/                 # React + Vite app for donor and request interfaces
├── .gitignore                # Secrets and build artifacts exclusions
├── README.md                 # Project overview and setup instructions
├── PRD.md                    # Product requirements and feature brief
├── package.json              # Monorepo scripts and root dependencies
├── pnpm-workspace.yaml       # Workspace configuration
├── vercel.json               # Deployment configuration
└── ...
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm or pnpm
- Firebase project credentials for Firestore and FCM

### Install dependencies
```bash
# Root workspace
npm install

# Frontend app
cd frontend
npm install
```

### Run the frontend
```bash
cd frontend
npm run dev
```
The app is expected to run on the Vite default local port, typically `http://localhost:8443` depending on environment config.

### Run the backend
```bash
cd backend
npm install
node server.js
```
The backend API will run on `http://localhost:8000` by default unless overridden with `PORT`.

### Environment configuration
Create a local environment file for Firebase and app settings if required, and do not commit secrets. Keep values such as Firebase service account files and `.env` files out of source control.

---

## Security Notes

- Firebase service account credentials must remain outside Git tracking.
- Environment variables should be stored in `.env` or `.env.local` files and ignored by Git.
- Sensitive files such as `backend/serviceAccountKey.json` are blocked from version control and should be loaded securely during deployment only.

---

## Verification

The frontend build is validated using:
```bash
cd frontend
npm run build
```
This confirms the TypeScript and Vite compilation pipeline is still healthy for production builds.

