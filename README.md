# Alaafia 🩺

> **From uncertainty to appropriate care.**

Alaafia is a voice-first, safety-controlled healthcare navigation platform designed for the Nigerian context. It helps users describe symptoms, understand potential urgency, receive safety guidance, and identify healthcare facilities appropriate to their situation.

Alaafia is not a diagnostic chatbot. Its purpose is to reduce the delay between a worrying symptom appearing and a person reaching appropriate care.

---

## Team Members

- **Racheal Olayode**: Backend Developer
- **Rukayat Fashina**: Product Designer
- **Dauda Mariam**: Frontend Developer

---

## Live Demo

- **Live application**: To be added
- **Backend API**: To be added
- **Recorded demo**: To be added

Local backend URL:

```text
http://localhost:5000
```

---

## The Problem

Healthcare emergencies often begin with uncertainty. Someone may experience chest pain, difficulty breathing, severe bleeding, seizures, sudden weakness, or another warning sign without knowing how serious it is or what to do next.

Even after deciding to seek care, finding the right facility can be difficult. The nearest hospital is not always the most suitable hospital. A facility may lack the required capability, specialty, or known emergency service.

This creates dangerous delays between:

```text
Recognizing a health problem → deciding what to do → reaching appropriate care
```

### How Might We?

> **How might we help people recognize potentially serious health situations early and connect them with appropriate healthcare facilities quickly and safely?**

---

## Our Solution

Alaafia combines voice/text consultation, structured symptom understanding, deterministic triage, safety guidance, capability-aware facility matching, navigation data, and emergency summaries.

```text
Speak → Understand → Triage → Guide → Route → Handoff
```

Users can:

- Start as a guest without registering first.
- Describe symptoms using text or voice.
- Confirm a speech transcript before it is processed.
- Continue a consultation with additional messages.
- Receive a LOW, MEDIUM, HIGH, or CRITICAL urgency classification.
- See why a case was escalated.
- Receive immediate safety guidance.
- Find facilities ranked by capability and distance.
- View facility coordinates and details.
- Select a facility and receive navigation coordinates.
- Activate Emergency Mode for CRITICAL cases.
- Generate an emergency summary and simulated handoff record.

### Core Principle

> **AI helps us understand the patient. Deterministic safety rules help us protect the patient.**

Alaafia does not claim to diagnose disease, replace clinicians, guarantee hospital capacity, or provide a clinical diagnosis.

---

## How Alaafia Works

```text
User
  ↓
Voice or text input
  ↓
OpenAI Whisper for audio transcription
  ↓
Structured symptom extraction and normalization
  ↓
Deterministic triage engine
  ↓
LOW / MEDIUM / HIGH / CRITICAL
  ↓
Safety guidance
  ↓
Capability-aware facility matching
  ↓
Facility recommendation and explanation
  ↓
Hospital selection and navigation coordinates
  ↓
Emergency Mode for CRITICAL cases
  ↓
Emergency summary and handoff record
```

The frontend communicates with Alaafia's backend. The frontend does not connect directly to the database or external provider credentials.

---

## Triage Safety Architecture

The triage engine checks higher-risk conditions before lower-acuity patterns:

1. **Critical overrides**: red flags always escalate to CRITICAL.
2. **High acuity**: significant warning signs require urgent assessment.
3. **Medium urgency**: symptoms need medical attention soon.
4. **Low urgency**: no recognized concerning pattern is present.

Examples of critical signals include:

- Unresponsiveness
- Severe respiratory distress
- Blue lips or face
- Major bleeding
- Active seizure
- Severe altered consciousness
- Stroke-like symptoms
- Severe allergic reaction
- Poisoning or overdose
- Severe trauma
- Chest pain combined with breathing difficulty

The engine returns explainable reasons and approved guidance. Internal scores support explainability; they are not medical certainty scores.

Clinical deployment requires formal clinical validation, medical governance, and regulatory review.

---

## Working MVP Features

### Authentication

- Guest sessions with location, language, and expiration.
- User registration with name, email, password, and optional phone.
- Password hashing with bcrypt.
- Six-digit email verification codes.
- Verification-code expiry and attempt limits.
- Resend verification codes.
- Welcome email after successful first-time verification.
- Login blocked until email verification is complete.
- JWT login tokens.
- Google ID-token login endpoint.

### Consultation

- Text consultation creation.
- Multi-turn consultation messages.
- Structured symptom persistence.
- Voice upload using `multipart/form-data`.
- In-memory audio processing.
- Transcript confirmation.
- Consultation status tracking.
- Emergency summary generation.

### AI and voice

- OpenAI Whisper transcription adapter.
- OpenAI structured symptom extraction with deterministic keyword fallback.
- YarnGPT Text-to-Speech adapter for Nigerian-language voice output.
- Symptom normalization across string and object-shaped provider responses.
- Deterministic triage independent of generated language responses.

### Facility and emergency coordination

- Simulated Lagos facility dataset for MVP testing.
- Haversine distance calculation.
- Capability-aware facility matching.
- Severity-based facility filtering.
- Recommendation scoring using capability match and distance.
- Explainable recommendation reasons.
- Facility verification and data-source fields.
- Explicit `UNKNOWN` readiness state when live readiness is unavailable.
- Hospital details and navigation coordinates.
- Hospital selection.
- CRITICAL-only Emergency Mode activation.
- Emergency summary and simulated handoff persistence.

---

## API Base URL

Development:

```text
http://localhost:5000/api/v1
```

### Authentication

```http
POST /auth/guest
POST /auth/register
POST /auth/verify-email
POST /auth/resend-verification
POST /auth/login
POST /auth/google
```

### Consultation

```http
POST /consultations
POST /consultations/:consultationId/message
POST /consultations/:consultationId/voice
POST /consultations/:consultationId/confirm-transcript
GET  /consultations/:consultationId
```

### Triage and guidance

```http
POST /triage
GET  /triage/:consultationId
GET  /guidance/:consultationId
```

### Hospitals and facilities

```http
GET  /hospitals/nearby
GET  /hospitals/recommended
GET  /hospitals/:hospitalId
POST /hospitals/:hospitalId/select
GET  /facilities
POST /facilities/search
```

### Emergency workflow

```http
POST /emergency/activate
POST /emergency/:emergencyId/summary
```

### Health check

```http
GET /health
```

Most contract endpoints use:

```json
{
  "success": true,
  "data": {},
  "message": "Request successful"
}
```

Errors use a structured error object containing a code, message, and details.

---

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Leaflet
- React Leaflet
- Axios
- Lucide React
- Tailwind CSS

The frontend owns the user interface, microphone interaction, audio playback, map display, hospital cards, navigation actions, loading states, and accessibility.

### Backend

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT
- bcryptjs
- Multer
- Nodemailer
- Helmet
- CORS
- Morgan
- Express Rate Limit

The backend owns authentication, database access, speech integrations, symptom processing, deterministic triage, facility matching, emergency workflows, and provider boundaries.

### External services

- OpenAI Whisper
- OpenAI structured extraction
- YarnGPT Text-to-Speech
- Google OAuth ID-token verification

---

## Local Setup

### Requirements

- Node.js
- PostgreSQL
- npm
- OpenAI API key for live transcription and structured extraction
- YarnGPT API key if using YarnGPT voice output

### Install dependencies

```powershell
cd backend
npm install
```

### Configure environment variables

Create `backend/.env` from `backend/.env.example`.

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/Alaafia_db
JWT_SECRET=replace-with-a-long-random-secret

GOOGLE_CLIENT_ID=your-web-client-id

YARNGPT_API_KEY=your-yarngpt-key
YARNGPT_BASE_URL=https://yarngpt.ai

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
SMTP_FROM=Alaafia <no-reply@example.com>
```

Never commit `.env`. Use secret variables in deployment environments.

### Seed simulated facilities

```powershell
npm run seed
```

This resets and seeds the local database with simulated Lagos facilities for MVP testing.

### Start the backend

Development mode:

```powershell
npm run dev
```

Normal mode:

```powershell
npm start
```

### Start the frontend

```powershell
cd frontend
npm install
npm run dev
```

---

## Testing with Postman

Import:

[backend/postman/Alaafia-MVP.postman_collection.json](backend/postman/Alaafia-MVP.postman_collection.json)

The collection contains the authentication and golden-path requests. Run them in this order:

```text
Health
→ Guest session
→ Register user
→ Verify email
→ Login
→ Create consultation
→ Run triage
→ Recommended hospitals
→ Select hospital
→ Activate Emergency Mode
→ Generate emergency summary
```

For voice testing, use the `Upload Voice Recording` request with a `.webm` file and set the form-data language to `en-NG` or another supported language code.

---

## Real, Simulated, and Pending Features

### Real and implemented in the MVP

- Backend API
- PostgreSQL persistence
- Guest sessions
- Email verification
- JWT authentication
- Text consultations
- Deterministic triage
- Simulated facility retrieval and ranking
- Hospital selection data
- Emergency summary persistence
- YarnGPT TTS adapter

### Simulated for the MVP

- Facility dataset
- Facility readiness
- Provider handoff receipt
- Live hospital operational status

### Pending external access or additional validation

- NHFR/HFR synchronization. NHFR has not yet provided API access, so simulated facilities are used and labelled accordingly.
- Verified partner-facility data.
- Wema integration, pending official API/product access.
- Real browser audio testing through OpenAI Whisper.
- Full provider readiness workflow.
- Production clinical validation.

We do not claim that simulated registry data represents real-time hospital capacity.

---

## Safety and Privacy

- Alaafia is not a diagnostic tool.
- Deterministic safety rules control severity classification.
- Critical red flags override lower-acuity patterns.
- Raw audio is processed in memory and is not stored as a database file.
- Verification codes are hashed before storage.
- Passwords are hashed before storage.
- External API keys remain backend-only.
- Facility source and verification status are returned explicitly.
- Unknown readiness is not represented as available capacity.
- Production deployment requires clinical governance and validation.

---

## Project Status

```text
Backend MVP golden path       Working
PostgreSQL persistence        Working
Authentication               Working
Email verification           Working
YarnGPT TTS adapter           Working
Text triage flow              Verified
Facility matching             Working with simulated data
Emergency summary             Working as simulated handoff
NHFR integration              Pending access
Wema integration              Pending official access
Provider readiness            Partial data model only
Production clinical use      Not approved
```

---

## Team

Built by the Alaafia team for Hackaholics 7.0 in Lagos, Nigeria.

> **Alaafia helps people move from uncertainty to appropriate care.**
