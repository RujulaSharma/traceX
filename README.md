# TraceX: Find the Intruder

**Autonomous Cybersecurity Investigation & Attack Reconstruction Platform** that detects, correlates, and explains multi-stage cyber intrusions from authentication, network, and server logs.

> **Hackathon Problem: ALG-CYBER-01 — Find the Intruder**  
> Analyze authentication, network, and server logs to identify suspicious users/IPs, connect related events, create an incident timeline, provide evidence, and explain the likely attack sequence.

---

## 🌐 Live Demo & Deployment

| Component | Target Platform | Live URL |
|---|---|---|
| **Frontend Web App** | Vercel (React + Vite) | [https://trace-x-tau.vercel.app](https://trace-x-tau.vercel.app) |
| **Backend REST API** | Render Web Service (FastAPI) | [https://tracex-backend-lcy5.onrender.com](https://tracex-backend-lcy5.onrender.com) |
| **API Documentation** | Swagger / OpenAPI UI | [https://tracex-backend-lcy5.onrender.com/docs](https://tracex-backend-lcy5.onrender.com/docs) |

---

## 🏗️ Production Architecture

```text
       ┌────────────────────────────────────────────────────────┐
       │                 Vercel CDN Edge Network                │
       │           TraceX Frontend (React 18 + Vite)            │
       │    • Dynamic API routing via VITE_API_URL              │
       │    • Client-side SPA routing rewrites (vercel.json)     │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   │ HTTPS JSON & Multipart
                                   │ (CORS configured for Vercel domain)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                   Render Web Service                   │
       │            TraceX Backend (FastAPI + Uvicorn)          │
       │    • Auto-adapting dynamic port ($PORT)                │
       │    • Automatic postgres:// to postgresql:// dialect    │
       │    • Deterministic MITRE ATT&CK detection engine       │
       │    • Graph correlation & kill-chain reconstruction     │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   │ Managed PostgreSQL Connection
                                   │ (Connection pooling & pre-ping)
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                Render Managed Database                 │
       │                  PostgreSQL 16 Engine                  │
       │    • Normalized Security Events table with JSON/JSONB  │
       │    • Composite query indexes for user, IP, and time    │
       │    • Forensic findings, incidents, and attack graphs   │
       └────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Instructions

### 1. Backend & Database Deployment (Render)

#### Option A: Infrastructure as Code (Render Blueprint)
1. Push this repository to GitHub.
2. In the Render Dashboard, click **New** $\rightarrow$ **Blueprint**.
3. Connect your repository. Render will automatically detect [`render.yaml`](render.yaml) and configure both the Web Service and PostgreSQL database.
4. Set the `FRONTEND_URL` environment variable to your deployed Vercel URL.

#### Option B: Manual Setup
1. **Create Managed Database**:
   - In Render Dashboard, click **New +** $\rightarrow$ **PostgreSQL**.
   - Name: `tracex-postgres`
   - Database: `tracex`
   - User: `tracex`
   - Region: Choose closest to your users.
   - Plan: Free.
   - Click **Create Database**. Copy the **Internal Database URL** (or External URL if deploying across platforms).

2. **Create Web Service**:
   - Click **New +** $\rightarrow$ **Web Service**.
   - Connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free.

3. **Configure Environment Variables**:
   Add the following in the Render Web Service settings:
   | Key | Value | Notes |
   |---|---|---|
   | `APP_ENV` | `production` | Enables production mode |
   | `LOG_LEVEL` | `INFO` | Standard structured logging |
   | `DATABASE_URL` | `<Your Render PostgreSQL URL>` | TraceX automatically normalizes `postgres://` to `postgresql://` |
   | `CORS_ORIGINS` | `https://<your-app>.vercel.app,http://localhost:5173` | Comma-separated list of allowed origins |
   | `FRONTEND_URL` | `https://<your-app>.vercel.app` | Dedicated frontend origin |

4. **Verify Health**:
   Once deployed, navigate to `https://<your-service>.onrender.com/api/health` to confirm `{"status":"healthy","database":"healthy"}`.

---

### 2. Frontend Deployment (Vercel)

1. Push this repository to GitHub.
2. Log in to [Vercel](https://vercel.com) and click **Add New** $\rightarrow$ **Project**.
3. Import your GitHub repository.
4. **Project Settings**:
   - **Root Directory**: Click edit and select `frontend`.
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   - Key: `VITE_API_URL`
   - Value: `https://<your-render-backend>.onrender.com` (do not include trailing slash)
6. Click **Deploy**.
7. Vercel will build the frontend and serve it globally. The provided [`frontend/vercel.json`](frontend/vercel.json) automatically handles SPA routes (e.g. `/soc`, `/dashboard`, `/incidents`) without 404 errors.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env` / Render)

| Variable | Type | Default | Description |
|---|---|---|---|
| `APP_ENV` | String | `development` | Environment name: `development`, `staging`, `production`. |
| `LOG_LEVEL` | String | `INFO` | Logging level: `DEBUG`, `INFO`, `WARNING`, `ERROR`. |
| `APP_HOST` | String | `0.0.0.0` | Bind host address. |
| `APP_PORT` | Integer | `8000` | Local port (overridden by `PORT` on Render/cloud). |
| `PORT` | Integer | `None` | Dynamically provided by Render. |
| `DATABASE_URL` | String | `sqlite:///./tracex.db` | PostgreSQL or SQLite connection string. |
| `CORS_ORIGINS` | String | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed CORS origins. |
| `FRONTEND_URL` | String | `None` | Production frontend domain for CORS whitelist. |
| `BRUTE_FORCE_THRESHOLD` | Integer | `5` | Failed logins threshold to trigger brute-force rule. |
| `BRUTE_FORCE_WINDOW_MINUTES` | Integer | `5` | Sliding window for brute-force detection. |
| `LOGIN_AFTER_FAILURES_THRESHOLD`| Integer | `3` | Failures required before successful login triggers takeover alert. |
| `PORT_SCAN_THRESHOLD` | Integer | `5` | Port scan probe count threshold. |

### Frontend (`frontend/.env` / Vercel)

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | String | `""` | Render backend base URL (e.g. `https://tracex-backend.onrender.com`). If empty, proxies to `/api` locally. |

---

## 🛠️ Local Development & Docker

### Option 1: Docker Compose (Full Stack with PostgreSQL)

```bash
# Clone the repository
git clone https://github.com/RujulaSharma/traceX.git
cd traceX

# Spin up PostgreSQL and Backend containers
docker-compose up --build
```

### Option 2: Run Locally (FastAPI + Vite)

#### 1. Backend (FastAPI + SQLite/PostgreSQL)
```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows (or: source venv/bin/activate on Linux/macOS)
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### 2. Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🎬 Live Hackathon Demo Walkthrough (3-Minute Script)

1. **Load Telemetry**:
   - Navigate to **Log Ingestion** (`/ingestion`).
   - Click **"Load Full Attack Scenario"** (or upload `data/sample_logs/attack_scenario_full.csv`).
   - Notice immediate format detection, validation, and sub-second ingestion.
2. **Execute Detection Engine**:
   - Click **"Proceed to Threat Detections"** (`/detections`).
   - Click **"Execute Detection Engine"** to trigger deterministic rules. Review confidence scores and MITRE ATT&CK tags.
3. **Reconstruct Attack Chain**:
   - Go to **Incidents & Graph** (`/incidents`).
   - Click **"Run Correlation Engine"** to aggregate signals into a unified threat incident.
4. **Inspect Incident Cockpit**:
   - Click on the generated incident (`/incidents/1`).
   - **Attack Topology Graph**: Observe the visual flow from attacker IP `185.220.101.5` $\rightarrow$ compromised user `jsmith` $\rightarrow$ triggered signals $\rightarrow$ database target `10.0.0.50`.
   - **Kill Chain Stages**: Review the 5-stage attack progression.
   - **Attack Timeline**: Filter by milestones to see the exact minute-by-minute sequence.
   - **Deterministic Narrative**: Review the explanation and immediate containment actions.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check & database connectivity probe |
| `POST` | `/api/logs/upload` | Ingest CSV, JSON, or NDJSON file |
| `GET` | `/api/events` | Query and filter normalized security events |
| `GET` | `/api/events/{id}` | Get event details and raw payload |
| `POST` | `/api/detections/run` | Execute detection rule engine |
| `GET` | `/api/detections` | List security findings |
| `GET` | `/api/detections/rules` | List registered detection rules |
| `POST` | `/api/correlation/run` | Execute correlation engine to create incidents |
| `GET` | `/api/incidents` | List correlated incidents |
| `GET` | `/api/incidents/{id}` | Get detailed incident record |
| `GET` | `/api/incidents/{id}/timeline` | Get unified chronological attack timeline |
| `GET` | `/api/incidents/{id}/evidence` | Get forensic evidence findings and events |
| `GET` | `/api/incidents/{id}/graph` | Get topological attack graph nodes and edges |
| `PATCH`| `/api/incidents/{id}/status` | Update incident workflow status |
| `GET` | `/api/stats/dashboard` | Aggregated metrics and telemetry charts |

---

## 🧪 Test Suite & Quality Verification

All 95 unit, integration, and rule tests pass with zero errors:

```bash
# Run backend test suite
cd backend
python -m pytest

# Static type analysis and linting
ruff check app tests
mypy app

# Frontend build & type check
cd ../frontend
npm run build
```
