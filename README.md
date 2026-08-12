# ErythroNet - Emergency Blood Matching Network

ErythroNet (formerly RedCellNet) is a decentralized emergency blood coordination network designed to provide structure, speed, and accountability to urban emergency blood donation. It replaces unstructured social media/WhatsApp broadcasts with a structured, verified, real-time board.

---

## Workspace Structure

The project is structured as a decoupled monorepo containing two main folders ready for independent deployment:

```text
ErythroNet with Next js and sql lite/
├── frontend/             <-- React + Vite (Deployable to Vercel)
│   ├── src/              <-- Page components, layouts, routing, types
│   ├── public/           <-- Static assets
│   ├── package.json      <-- Independent dependencies
│   ├── vite.config.ts    <-- Vite build and Figma Make configuration
│   └── .env.production   <-- Production API configuration
├── backend/              <-- FastAPI + SQLite (Deployable to Render)
│   ├── app/              <-- API endpoints, models, routers, schemas
│   ├── uploads/          <-- Prescription and verification storage (absolute resolution)
│   ├── erythronet.db     <-- SQLite database
│   ├── requirements.txt  <-- Python dependencies
│   ├── Procfile          <-- Render startup configuration
│   └── .env              <-- Environment variables for database & port
├── pnpm-workspace.yaml   <-- Root workspaces configuration
├── package.json          <-- Monorepo task runner (delegates commands to frontend)
└── README.md             <-- Documentation
```

---

## Local Development Setup

### Prerequisite Tooling
* Node.js v22
* pnpm v10
* Python 3.10+

### 1. Frontend Setup
Workspaces are configured, allowing all dependency resolution and command execution from the root directory:
```bash
# Install dependencies from root
pnpm install --ignore-scripts

# Launch the development server
pnpm run dev
```
The frontend dev server runs at `http://localhost:8443`.

### 2. Backend Setup
Navigate into the `/backend` folder and run:
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python run.py
```
The API documentation is accessible at `http://localhost:8000/docs`.

---

## Deployment Readiness

### Frontend (Vercel Target)
The `/frontend` folder is configured for Vercel deployment:
* Relative path aliasing (`@/*`) is fully self-contained inside the `frontend` package.
* Env variables `VITE_API_BASE_URL` are defined in `.env.development` and `.env.production`.
* To deploy: Set the Vercel **Root Directory** to `frontend`.

### Backend (Render Target)
The `/backend` folder is configured for Render deployment:
* `requirements.txt` contains all necessary dependencies.
* `Procfile` is set up with: `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
* `main.py` is configured with CORS origin regex to support dynamic `https://*.vercel.app` requests.
* `config.py` resolves `UPLOAD_DIR` dynamically via absolute filesystem paths, ensuring robust execution.
