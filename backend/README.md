# ALAFIA Backend - Voice-First Healthcare Navigation

The ALAFIA backend is a Node.js/Express API that implements the core healthcare triage and facility matching logic for the MVP.

## Architecture

```
USER VOICE/TEXT INPUT
        ↓
    [Speech-to-Text via Self-Hosted Whisper]
        ↓
  [Symptom Extraction via NLU]
        ↓
    [Triage Engine - Layered Rules]
        ↓
[Critical → High → Medium → Low]
        ↓
[Facility Matching - Capability + Distance]
        ↓
  [Hospital Recommendations]
        ↓
  [Emergency Summary]
```

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL + Sequelize ORM
- **AI Services**: OpenAI (structured extraction) + self-hosted Whisper speech-to-text + YarnGPT Text-to-Speech
- **Authentication**: JWT (ready to implement)
- **Validation**: Express validation middleware

## Project Structure

```
src/
├── config/
│   └── database.js              # PostgreSQL connection
├── models/
│   ├── Consultation.js          # Consultation session model
│   ├── TriageResult.js          # Triage output model
│   ├── Facility.js              # Hospital/clinic model
│   └── index.js                 # Model associations
├── triage/
│   ├── engine.js                # Core triage logic
│   ├── rules.js                 # Red flags, patterns, thresholds
│   └── index.js
├── integrations/
│   ├── openai.js                # Structured symptom extraction
│   ├── yarngpt.js               # Nigerian-language text-to-speech
│   └── speech/                  # Speech-to-text abstraction
│       ├── speech.service.js    # Provider-agnostic transcribeAudio()
│       └── whisper.adapter.js   # Self-hosted Whisper HTTP adapter
├── services/
│   └── facilityMatching.js      # Capability + distance ranking
├── controllers/
│   ├── consultationController.js # Consultation orchestration
│   └── facilityController.js    # Facility CRUD & search
├── routes/
│   ├── consultationRoutes.js    # Consultation endpoints
│   └── facilityRoutes.js        # Facility endpoints
├── middleware/
│   └── (auth, validation - ready to implement)
├── utils/
│   ├── seed.js                  # Database seeding
│   └── facilitySeeds.js         # Simulated facility data
├── app.js                       # Express app setup
└── server.js                    # Server initialization
```

## Setup & Installation

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DB_NAME=alafia_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini

# Self-hosted Whisper speech-to-text (see /whisper-service)
WHISPER_SERVICE_URL=http://localhost:8001
WHISPER_SERVICE_TOKEN=
WHISPER_TIMEOUT_MS=30000

# YarnGPT
YARNGPT_API_KEY=your-yarngpt-api-key
YARNGPT_BASE_URL=https://yarngpt.ai

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Set Up PostgreSQL

Ensure PostgreSQL is running locally or configure the connection above.

### 4. Seed the Database (Optional)

For MVP testing with simulated facilities:

```bash
npm run seed
```

This populates 8 simulated hospitals in Lagos with various capabilities.

### 5. Start the Server

**Development mode** (with hot-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

Server starts on `http://localhost:5000`

Interactive API documentation is available at `http://localhost:5000/api-docs`.
The raw OpenAPI JSON document is available at `http://localhost:5000/api-docs.json`.

## API Endpoints

### Consultations

#### 1. Start a Consultation

```
POST /api/v1/consultations/start
Body: { userId?, language: "en-NG" }
Response: { consultationId, message }
```

#### 2. Submit Symptoms & Get Triage

```
POST /api/v1/consultations/:consultationId/submit
Body: {
  input: "string",                          // Text input
  audioBase64: "string",                    // Base64 audio (optional)
  isAudio: boolean,                         // Whether input is audio
  age: number,                              // User age (optional)
  isPregnant: boolean,                      // Pregnancy status
  chronicDiseases: ["diabetes", ...],       // Existing conditions
  userLocation: {                           // User coordinates
    latitude: 6.5244,
    longitude: 3.3792
  },
  language: "en-NG"                        // Language code
}
Response: {
  consultationId,
  triageResult: {
    severity: "CRITICAL|HIGH|MEDIUM|LOW",
    recommendedAction,
    guidance,
    reasons,
    facilityTypes
  },
  extractedInformation: { symptoms, confidence },
  facilityRecommendations: { facilities, searchParameters },
  disclaimer
}
```

#### 3. Get Consultation Details

```
GET /api/v1/consultations/:consultationId
Response: { consultation, triageResult }
```

#### 4. Generate Emergency Summary

```
POST /api/v1/consultations/:consultationId/emergency-summary
Response: { summary: { severity, symptoms, redFlags, guidance, ... } }
```

### Facilities

#### 1. Get All Facilities

```
GET /api/v1/facilities
Response: { facilities: [...], count }
```

#### 2. Search Facilities by Location

```
POST /api/v1/facilities/search
Body: {
  latitude: 6.5244,
  longitude: 3.3792,
  severity: "CRITICAL|HIGH|MEDIUM|LOW",
  capabilities: ["cardiology", "emergency"],
  maxDistance: 15
}
Response: { facilities, searchParameters, totalFound }
```

#### 3. Create Facility (Admin)

```
POST /api/v1/facilities
Body: { name, facilityType, latitude, longitude, ... }
```

#### 4. Update Facility Status

```
PUT /api/v1/facilities/:facilityId/status
Body: { status: "operational|limited|closed|unknown" }
```

## Triage Engine

### Layered Decision Logic

The triage engine uses **four-layer hierarchical decision logic**:

**Layer 1 — Critical Red Flags** (checked first)

- Unresponsiveness
- Severe respiratory distress
- Active major bleeding
- Seizures
- Stroke-like symptoms
- Severe allergic reactions
  → Always **CRITICAL**

**Layer 2 — High-Acuity Patterns**

- Chest pain
- Breathing difficulty
- Severe headache
- Severe abdominal pain
  → **HIGH**

**Layer 3 — Moderate-Urgency**

- Fever, cough, diarrhea
- Mild-moderate abdominal pain
  → **MEDIUM**

**Layer 4 — Low-Urgency**

- Minor symptoms, self-manageable
  → **LOW**

### Example: Chest Pain + Breathing Difficulty

```
Input: "I have chest pain and I'm having difficulty breathing"
↓
AI Extraction: ["chest_pain", "shortness_of_breath"]
↓
Triage Engine:
  - Layer 1: Check critical flags
    → Chest pain + breathing = HIGH-RISK PATTERN
    → Severity: CRITICAL or HIGH (depending on additional factors)
  - Output:
    severity: "HIGH"
    reasons: ["Chest pain", "Difficulty breathing"]
    recommendedAction: "URGENT_CARE"
    facilityTypes: ["hospital", "urgent_care", "clinic"]
↓
Facility Matching:
  - Find hospitals within 15km with emergency capability
  - Rank by: 60% capability match + 40% proximity
  - Return top 3
```

## Facility Matching Algorithm

### Scoring Formula

```
Overall Score = (Capability Match × 0.6) + (Distance Score × 0.4)

Where:
- Capability Match = matched_capabilities / required_capabilities × 100
- Distance Score = max(0, 100 - (distance / max_distance) × 100)
```

### Example: CRITICAL Severity

For a CRITICAL case (chest pain + breathing):

1. **Filter by facility type**: Only hospitals
2. **Calculate capability match**:
   - Required: ["emergency", "cardiology", "intensive_care"]
   - Hospital A has all 3 → 100% match
   - Hospital B has 2 → 67% match
3. **Calculate distance score**:
   - Hospital A: 2km away → Distance score = 87
   - Hospital B: 8km away → Distance score = 47
4. **Overall ranking**:
   - Hospital A: (100 × 0.6) + (87 × 0.4) = 95 ← Recommended
   - Hospital B: (67 × 0.6) + (47 × 0.4) = 59

## Data Models

### Consultation

- `id` (UUID, primary key)
- `userId` (string, optional)
- `initialInput` (text)
- `initialTranscript` (text)
- `transcriptConfidence` (0-1 float)
- `extractedSymptoms` (JSONB array)
- `followUpQuestions` (JSONB)
- `followUpAnswers` (JSONB)
- `language` (enum: en, yo, ha, ig, pcm)
- `status` (enum: initiated, in_progress, triaged, completed)
- `createdAt`, `updatedAt`

### TriageResult

- `id` (UUID, primary key)
- `consultationId` (UUID, foreign key)
- `severity` (enum: LOW, MEDIUM, HIGH, CRITICAL)
- `internalScore` (0-100)
- `detectedRedFlags` (JSONB array)
- `triageReasons` (JSONB array)
- `recommendedAction` (enum)
- `inputConfidence` (enum: LOW, MEDIUM, HIGH)
- `emergencyGuidance` (text)
- `facilityType` (string)
- `createdAt`, `updatedAt`

### Facility

- `id` (UUID, primary key)
- `name` (string)
- `facilityType` (enum: hospital, clinic, urgent_care, pharmacy)
- `latitude`, `longitude` (float)
- `address`, `phone`, `email` (strings)
- `capabilities` (JSONB array: ["emergency", "cardiology", ...])
- `emergencyCapable` (boolean)
- `operationalStatus` (enum: operational, limited, closed, unknown)
- `operationalStatusUpdatedAt` (datetime)
- `dataSource` (string: "simulated", "NHFR", "manual")
- `verificationStatus` (enum: verified, unverified, pending)
- `createdAt`, `updatedAt`

## Important Notes

### Safety & Compliance

- **AI assists, rules decide**: The triage engine prioritizes deterministic safety rules over AI scoring
- **No medical claims**: The system explicitly disclaims any medical diagnostic ability
- **Red flags override**: Critical red flags automatically escalate to CRITICAL regardless of scoring
- **Privacy**: Raw audio is processed in memory and never persisted; only confirmed transcripts are stored

### MVP Limitations

- **Simulated facilities**: MVP uses seeded facility data, not live NHFR API
- **No real-time bed capacity**: System recommends based on capability and distance, not bed availability
- **No live ambulance dispatch**: Recommendations are facility locations only
- **Prototype triage**: For hackathon demonstration; clinical deployment requires medical validation

### Future Integrations

- **NHFR/HFR API**: Real facility data from Nigeria Health Facility Registry
- **Wema Banking**: Emergency care fund savings and healthcare payment integration
- **Provider Portal**: Hospital dashboard for operational status updates
- **EHR Handoff**: Hospital system integration for patient record transfer

## Testing

### Manual API Testing

Use Postman or cURL:

```bash
# Start consultation
curl -X POST http://localhost:5000/api/v1/consultations/start

# Submit symptoms
curl -X POST http://localhost:5000/api/v1/consultations/{consultationId}/submit \
  -H "Content-Type: application/json" \
  -d '{"input": "I have chest pain and difficulty breathing"}'

# Search facilities
curl -X POST http://localhost:5000/api/v1/facilities/search \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 6.5244,
    "longitude": 3.3792,
    "severity": "HIGH"
  }'
```

## Environment Variables Reference

| Variable                     | Description                 | Default                 |
| ---------------------------- | --------------------------- | ----------------------- |
| `DB_NAME`                    | PostgreSQL database name    | `alafia_db`             |
| `DB_USER`                    | PostgreSQL user             | `postgres`              |
| `DB_PASSWORD`                | PostgreSQL password         | `postgres`              |
| `DB_HOST`                    | PostgreSQL host             | `localhost`             |
| `DB_PORT`                    | PostgreSQL port             | `5432`                  |
| `OPENAI_API_KEY`             | OpenAI API key              | (required for live AI)  |
| `OPENAI_MODEL`               | Structured extraction model | `gpt-4o-mini`           |
| `WHISPER_SERVICE_URL`        | Self-hosted Whisper URL     | `http://localhost:8001` |
| `WHISPER_SERVICE_TOKEN`      | Whisper service auth token  | (empty disables auth)   |
| `WHISPER_TIMEOUT_MS`         | Transcription timeout       | `30000`                 |
| `YARNGPT_API_KEY`            | YarnGPT TTS API key         | (required for live TTS) |
| `PORT`                       | Server port                 | `5000`                  |
| `NODE_ENV`                   | Environment                 | `development`           |
| `FRONTEND_URL`               | Frontend CORS origin        | `http://localhost:3000` |

## License

ISC

---

**Built for Hackaholics 7.0 by Recursive R's**
