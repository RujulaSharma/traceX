# TraceX Fix Plan

Generated: 2026-10-20

## Priority 1: Fix Detection Page Mismatch (BUG-001) [COMPLETED]
- **Target**: Align `frontend/src/pages/Detections.tsx` and `frontend/src/services/api.ts` with backend schemas.
- **Status**: Implemented, verified against live backend, frontend build passed, pushed in `a63132a`.

## Priority 2: Fix Event Explorer Endpoint Route (BUG-002) [COMPLETED]
- **Target**: Update `frontend/src/services/api.ts` to call `/logs/events` instead of `/events` in `getEvents`.
- **Status**: Implemented and verified in commit `8753058`.
- **Acceptance Criteria**:
  - `GET /api/logs/events` is invoked with query parameters (`limit`, `skip`/`offset`).
  - Response array is normalized to `{ total: number, events: SecurityEvent[] }`.
  - Frontend typecheck passes.
  - Event Explorer renders loaded events.

## Priority 3: Fix Incident List Response Wrapping (BUG-003) [COMPLETED]
- **Target**: Update `getIncidents` in `frontend/src/services/api.ts` to wrap array responses in `{ total: number, incidents: Incident[] }`.
- **Status**: Implemented and verified in commit `8753058`.
- **Acceptance Criteria**:
  - Returns properly formatted object.
  - Incidents page correctly renders list.

## Priority 4: Metadata Fallback & Credential Cleanup [COMPLETED]
- **Target**: Remove sensitive connection string from `.env.example`, remove synthetic `T1110`/`ATT&CK` fallbacks in `api.ts` and `Detections.tsx`, and safely handle `getEventById`.
- **Status**: Implemented and verified.
