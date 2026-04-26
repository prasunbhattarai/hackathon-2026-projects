# FundusAI Backend — Canonical API Contract (Frozen: Chunk 0)

This document is the single source of truth for all endpoint shapes, envelopes, enums,
and constraints. Any future change to an endpoint **must** be updated here first.

---

## 1. Global Response Envelope

Every endpoint returns this wrapper:

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

On failure:

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { "field": ["error description"] }
  }
}
```

Paginated collections wrap their items inside `data`:

```json
{
  "success": true,
  "data": {
    "items": [ ... ],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  },
  "error": null
}
```

---

## 2. Canonical Error Codes

| Code                  | HTTP | Meaning                          |
| --------------------- | ---- | -------------------------------- |
| `VALIDATION_ERROR`    | 422  | Pydantic / request body failures |
| `AUTH_REQUIRED`       | 401  | Missing or malformed token       |
| `TOKEN_EXPIRED`       | 401  | JWT expired                      |
| `FORBIDDEN`           | 403  | Insufficient role                |
| `NOT_FOUND`           | 404  | Resource not found               |
| `CONFLICT`            | 409  | Duplicate resource               |
| `UPLOAD_INVALID_TYPE` | 422  | File is not JPEG/PNG             |
| `UPLOAD_TOO_LARGE`    | 422  | File exceeds 10 MB               |
| `UPLOAD_TOO_SMALL`    | 422  | Image dimensions below 224×224   |
| `QUALITY_FAILED`      | 422  | Image failed quality pre-check   |
| `INFERENCE_FAILED`    | 500  | AI model raised an error         |
| `INTERNAL_ERROR`      | 500  | Unexpected server error          |

---

## 3. Roles

Two roles only:

| Value         | Capabilities                                                                |
| ------------- | --------------------------------------------------------------------------- |
| `super_admin` | Manage doctors, clinics, platform stats; read all cases/patients            |
| `doctor`      | Create/read patients in own clinic; upload + review cases; read own reports |

---

## 4. Auth Endpoints

Base prefix: `/api/v1/auth`

| Method | Path            | Auth required | Description                                  |
| ------ | --------------- | ------------- | -------------------------------------------- |
| POST   | `/auth/login`   | No            | Exchange email+password for Supabase session |
| POST   | `/auth/logout`  | Yes           | Invalidate session                           |
| POST   | `/auth/refresh` | No            | Refresh access token using refresh token     |
| GET    | `/auth/me`      | Yes           | Return current user profile                  |

### POST /auth/login

Request:

```json
{ "email": "string", "password": "string" }
```

Response `data`:

```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "doctor | super_admin",
    "clinicId": "uuid | null",
    "fullName": "string",
    "isActive": true,
    "createdAt": "ISO8601"
  },
  "accessToken": "string",
  "tokenType": "Bearer",
  "expiresIn": 3600
}
```

### POST /auth/refresh

Request:

```json
{ "refreshToken": "string" }
```

Response `data`: `{ "accessToken": "string" }`

### POST /auth/logout

Response `data`: `{ "message": "Logged out successfully" }`

### GET /auth/me

Response `data`: full `User` object (same shape as login.user)

---

## 5. Patient Endpoints

Base prefix: `/api/v1/patients`

| Method | Path             | Auth | Role                | Description           |
| ------ | ---------------- | ---- | ------------------- | --------------------- |
| POST   | `/patients`      | Yes  | doctor, super_admin | Create patient        |
| GET    | `/patients`      | Yes  | doctor, super_admin | Paginated list        |
| GET    | `/patients/{id}` | Yes  | doctor, super_admin | Detail + case history |
| PATCH  | `/patients/{id}` | Yes  | doctor, super_admin | Update patient        |

### Query params for GET /patients

| Param    | Type | Default | Description                          |
| -------- | ---- | ------- | ------------------------------------ |
| `page`   | int  | 1       | Page number                          |
| `limit`  | int  | 10      | Items per page (max 100)             |
| `search` | str  | —       | Fuzzy match on fullName or medicalId |

### POST /patients body

```json
{
  "fullName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "male | female | other",
  "contact": "string",
  "medicalId": "string"
}
```

### Patient objects

`PatientSummary` (used in list + nested in CaseDetail):

```json
{
  "id": "uuid",
  "fullName": "string",
  "medicalId": "string",
  "age": 42,
  "lastCaseDate": "ISO8601 | null",
  "totalCases": 3
}
```

`PatientDetail` (used in detail endpoint):

```json
{
  "id": "uuid",
  "clinicId": "uuid",
  "fullName": "string",
  "dateOfBirth": "YYYY-MM-DD",
  "gender": "male | female | other",
  "contact": "string",
  "medicalId": "string",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "cases": [ CaseSummary, ... ]
}
```

---

## 6. Case Endpoints

Base prefix: `/api/v1/cases`

| Method | Path                  | Auth         | Description                              |
| ------ | --------------------- | ------------ | ---------------------------------------- |
| POST   | `/cases/upload`       | Yes          | Upload image + create case (canonical)   |
| POST   | `/reports/upload`     | Yes          | Alias for `/cases/upload` — same handler |
| GET    | `/cases`              | Yes          | Paginated case list with filters         |
| GET    | `/cases/{id}`         | Yes          | Case detail                              |
| GET    | `/cases/{id}/status`  | Yes          | Lightweight status poll                  |
| POST   | `/cases/{id}/approve` | Yes (doctor) | Approve case after review                |
| POST   | `/cases/{id}/reject`  | Yes (doctor) | Reject case with reason                  |

### Case Status Lifecycle

```
[upload received]
      │
      ▼
  processing  ──────────────────────────────► failed
      │
      ├──[quality check fails]──► quality_failed
      │
      ▼
  awaiting_review  ──► approved
                   └─► rejected
```

### Upload — POST /cases/upload (multipart/form-data)

Fields:
| Field | Type | Required |
|-------|------|----------|
| `patientId` | string (uuid) | Yes |
| `image` | file (JPEG/PNG) | Yes |

Image constraints:

- Allowed MIME types: `image/jpeg`, `image/png`
- Max size: 10 MB
- Min dimensions: 224 × 224 px

Response `data`:

```json
{
  "caseId": "uuid",
  "status": "processing",
  "qualityCheck": "good | blurry | poor_lighting | overexposed",
  "taskId": "uuid",
  "message": "Image uploaded and queued for analysis"
}
```

### GET /cases — query params

| Param          | Type         | Default |
| -------------- | ------------ | ------- |
| `page`         | int          | 1       |
| `limit`        | int          | 10      |
| `status`       | CaseStatus   | —       |
| `priorityTier` | PriorityTier | —       |

### CaseSummary (list item):

```json
{
  "id": "uuid",
  "patientName": "string",
  "status": "CaseStatus",
  "priorityTier": "critical | high | medium | low",
  "priorityScore": 0.0,
  "imageQuality": "good | blurry | poor_lighting | overexposed",
  "drStatus": "None | Mild | Moderate | Severe | PDR",
  "createdAt": "ISO8601"
}
```

### CaseDetail (single item):

```json
{
  "id": "uuid",
  "patientId": "uuid",
  "clinicId": "uuid",
  "submittedBy": "uuid",
  "imageUrl": "string",
  "imageQuality": "ImageQuality",
  "status": "CaseStatus",
  "priorityScore": 0.0,
  "priorityTier": "PriorityTier",
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601",
  "patient": PatientSummary,
  "submittedByUser": { "id": "uuid", "fullName": "string" }
}
```

### GET /cases/{id}/status response `data`:

```json
{ "status": "CaseStatus", "priorityScore": 0.0 }
```

### POST /cases/{id}/approve — no body, response `data`: CaseDetail

### POST /cases/{id}/reject body:

```json
{ "reason": "string" }
```

Response `data`: CaseDetail

---

## 7. Analysis Endpoints

Base prefix: `/api/v1/analysis`

| Method | Path                 | Auth | Description           |
| ------ | -------------------- | ---- | --------------------- |
| GET    | `/analysis/{caseId}` | Yes  | AI results for a case |

### AnalysisResult:

```json
{
  "id": "uuid",
  "caseId": "uuid",
  "dr": {
    "status": "None | Mild | Moderate | Severe | PDR",
    "confidence": 0.87,
    "severityLevel": 1
  },
  "glaucoma": { "risk": "Low | Medium | High", "confidence": 0.72 },
  "hypertensiveRetinopathy": {
    "risk": "Low | Medium | High",
    "confidence": 0.91
  },
  "finalDecision": "string",
  "recommendation": "string",
  "ragJustification": "string",
  "heatmapUrl": "string | null",
  "severityLevel": 2,
  "decisionConfidence": "Clear diagnosis | Suspicious, review needed | Uncertain, further tests recommended",
  "createdAt": "ISO8601"
}
```

---

## 8. Report Endpoints

Base prefix: `/api/v1/reports`

| Method | Path                        | Auth | Description                          |
| ------ | --------------------------- | ---- | ------------------------------------ |
| GET    | `/reports/{caseId}/doctor`  | Yes  | Doctor-facing clinical report (JSON) |
| GET    | `/reports/{caseId}/patient` | Yes  | Patient-friendly report (JSON)       |
| GET    | `/reports/{caseId}/pdf`     | Yes  | PDF download URL (time-limited)      |

Query param for PDF: `type=doctor|patient` (default: `doctor`)

### DoctorReport:

```json
{
  "reportType": "doctor",
  "patient": { "fullName": "string", "age": 42, "gender": "male" },
  "diagnosis": {
    "primary": "string",
    "severity": "string",
    "confidence": "string"
  },
  "planOfAction": "string",
  "medicationSuggestions": ["string"],
  "ragJustification": "string",
  "heatmapUrl": "string",
  "disclaimer": "This tool is not a medical diagnostic system...",
  "generatedAt": "ISO8601"
}
```

### PatientReport:

```json
{
  "reportType": "patient",
  "summary": "string",
  "whatWasFound": "string",
  "nextSteps": "string",
  "severityLabel": "string",
  "urgency": "string",
  "disclaimer": "This tool is not a medical diagnostic system...",
  "generatedAt": "ISO8601"
}
```

### PDFDownloadUrl:

```json
{ "url": "string", "expiresAt": "ISO8601" }
```

---

## 9. Admin Endpoints

Base prefix: `/api/v1/admin`

All admin endpoints require `super_admin` role.

| Method | Path                           | Description                     |
| ------ | ------------------------------ | ------------------------------- |
| GET    | `/admin/clinics`               | List all clinics                |
| POST   | `/admin/clinics`               | Create a clinic                 |
| GET    | `/admin/users`                 | List users (filter by clinicId) |
| POST   | `/admin/users`                 | Create a doctor account         |
| POST   | `/admin/users/{userId}/status` | Activate/deactivate user        |
| GET    | `/admin/stats`                 | Platform-wide aggregate stats   |

### CreateClinicRequest:

```json
{ "name": "string", "address": "string", "phone": "string" }
```

### CreateUserRequest:

```json
{
  "email": "string",
  "fullName": "string",
  "role": "doctor",
  "clinicId": "uuid | null"
}
```

### PlatformStats:

```json
{
  "totalClinics": 0,
  "totalUsers": 0,
  "totalCases": 0,
  "todayCases": 0,
  "criticalCases": 0,
  "avgProcessingTimeMs": 0
}
```

---

## 10. Health Endpoint

| Method | Path             | Auth | Description    |
| ------ | ---------------- | ---- | -------------- |
| GET    | `/api/v1/health` | No   | Liveness check |

Response `data`:

```json
{ "status": "ok", "message": "FastAPI server is running" }
```

Note: health uses the same `ApiResponse` envelope as all other endpoints.

---

## 11. Non-Goals for MVP

- WebSocket / SSE real-time updates (use polling via `/cases/{id}/status`)
- Lab assistant role
- Clinic admin role
- Advanced analytics dashboards
- Patient self-registration
- Doctor self-registration (doctors created by super_admin only)
