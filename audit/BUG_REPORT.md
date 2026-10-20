# TraceX Bug Report

Generated: 2026-10-20
Environment Tested: 
- Deployed Frontend: https://trace-x-tau.vercel.app
- Deployed Backend: https://tracex-backend-lcy5.onrender.com (Render Web Service)
- Database: Render Managed PostgreSQL
- Local Workspace: Python 3.12 (venv), Node.js v24.13.0, Vite 6.4.3

---

## 1. Detection Page Mismatched Response Properties

- **Issue ID**: BUG-001
- **Severity**: Critical
- **Status**: Fixed and Verified
- **Affected Files**:
  - `frontend/src/pages/Detections.tsx`
  - `frontend/src/services/api.ts`
- **Reproduction Steps**:
  1. Open the Detection page (`/soc/detections`).
  2. Click "Execute Detection Engine".
  3. Observe the notice text and findings table.
- **Expected Behavior**:
  Notice reads: `Analysis complete: Evaluated X events, found Y new threat signals!`, and table displays loaded findings with count `Showing X of Y findings`.
- **Actual Behavior (Before Fix)**:
  Notice displayed: `Analysis complete: Evaluated undefined events, found undefined new threat signals!`, and table showed `0 of 0 findings`.
- **Root Cause**:
  1. `POST /api/detections/run` returns `{ success, events_analyzed, findings_generated, findings_stored, rules_executed, message, findings }`. The frontend code in `Detections.tsx` was accessing `res.total_events_evaluated` and `res.new_findings_count` (both `undefined`).
  2. `GET /api/detections` returns a direct JSON array of `DetectionFindingResponse` objects. The frontend expected an object `{ total, findings }`, causing `res.data.findings` to be `undefined`.
- **Fix Applied**:
  - `Detections.tsx`: Updated property references to `res.events_analyzed ?? res.total_events_evaluated ?? 0` and `res.findings_generated ?? res.new_findings_count ?? 0`.
  - `api.ts`: Added response normalization to `getDetections` returning `{ total, findings }` and mapping backend finding records with appropriate fallbacks (`entity_value`, `event_count`, `title`).

---

## 2. Event Explorer API Route Mismatch (`/events` vs `/logs/events`)

- **Issue ID**: BUG-002
- **Severity**: Medium
- **Status**: Confirmed
- **Affected Files**:
  - `frontend/src/services/api.ts`
- **Reproduction Steps**:
  1. Navigate to `/soc/events` (Event Explorer).
  2. Frontend makes a request to `GET /api/events`.
- **Expected Behavior**:
  `GET /api/events` returns list of ingested security events.
- **Actual Behavior**:
  Backend returns `404 Not Found` because the registered FastAPI endpoint is `/api/logs/events`.
- **Root Cause**:
  In `frontend/src/services/api.ts`, `getEvents` was calling `/events` instead of `/logs/events`.
- **Planned Fix**:
  Update `getEvents` in `api.ts` to query `/logs/events` and normalize the response array into `{ total: data.length, events: data }`.

---

## 3. Incident List API Response Array Wrapping

- **Issue ID**: BUG-003
- **Severity**: Low
- **Status**: Confirmed
- **Affected Files**:
  - `frontend/src/services/api.ts`
- **Reproduction Steps**:
  1. Navigate to `/soc/incidents`.
  2. Frontend calls `tracexApi.getIncidents()`.
- **Expected Behavior**:
  Returns `{ total: number, incidents: Incident[] }`.
- **Actual Behavior**:
  Backend returns raw array `list[IncidentResponse]`. `data.incidents` evaluates to `undefined`, although `Incidents.tsx` safely falls back to `[]`.
- **Root Cause**:
  `getIncidents` in `api.ts` does not wrap or adapt raw list responses from `/api/incidents`.
- **Fix Applied**:
  Update `getIncidents` in `api.ts` to wrap raw array responses as `{ total: data.length, incidents: data }`.
