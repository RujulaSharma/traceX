# TraceX Deployment Verification

Generated: 2026-10-20

## 1. Architecture Topology
```
[User Browser]
      │
      ▼
[Vercel Frontend (https://trace-x-tau.vercel.app)]
      │
      │ (Rewrites in vercel.json: /api/* -> https://tracex-backend-lcy5.onrender.com/api/*)
      ▼
[Render FastAPI Backend (https://tracex-backend-lcy5.onrender.com)]
      │
      ▼
[Render Managed PostgreSQL Database]
```

## 2. Configuration Audit
- **CORS Configuration**:
  Backend `main.py` applies CORS with `settings.parsed_cors_origins` permitting localhost and production frontend domains.
- **Vercel Proxy Rewrites (`vercel.json` and `frontend/vercel.json`)**:
  Both configurations map `/api/:path*` -> `https://tracex-backend-lcy5.onrender.com/api/:path*`.
  Verified working directly with multipart upload and GET requests.
- **Python Version Pin**:
  Pinned to Python 3.12 via `.python-version` and `render.yaml` ensuring Pydantic and dependencies install without issue.
- **Database Connectivity**:
  Verified `healthy` on Render PostgreSQL via `/api/health`.

## 3. Deployment Risks & Considerations
- **Render Free Tier Spin-Down**:
  Render spin-down on inactivity can cause a 30-50s initial latency on the first request. The frontend should handle longer timeouts gracefully.
- **API URL Consistency**:
  `api.ts` checks `VITE_API_URL` or falls back to production Render backend URL. Because Vercel rewrite proxy `/api/*` is also configured, calls to `/api/...` succeed either way.
