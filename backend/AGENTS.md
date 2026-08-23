# ALAFIA — Self-Hosted Whisper Integration Agent Instructions

## 1. Project Context

Alafia is a voice-first healthcare triage and emergency-care coordination backend designed for Nigeria.

The backend is built with:

- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT authentication
- Multer
- OpenAI integrations
- YarnGPT integration
- Deterministic triage rules
- Hospital/facility matching
- Emergency coordination

The backend is responsible for:

1. Receiving patient text or voice input.
2. Converting voice input into text.
3. Extracting and normalizing symptoms.
4. Running deterministic medical triage rules.
5. Providing safety guidance.
6. Matching patients to appropriate healthcare facilities.
7. Supporting emergency workflows and handoff records.
8. Returning structured responses to the frontend.

The frontend is a separate Next.js application.

This task is specifically about replacing the current OpenAI Whisper API transcription dependency with a self-hosted Whisper transcription service.

---

# 2. Primary Objective

Implement a self-hosted Whisper speech-to-text service that integrates cleanly with the existing Alafia Node.js/Express backend.

The new architecture should be:

Patient
→ Frontend records audio
→ Alafia Node.js backend receives multipart audio
→ Self-hosted Whisper service transcribes audio
→ Backend returns transcript
→ Patient confirms transcript
→ Existing symptom extraction
→ Existing deterministic triage
→ Existing facility matching
→ Existing guidance/emergency workflow
→ YarnGPT handles approved voice output

The goal is to replace the current OpenAI Whisper transcription provider without changing the existing consultation, symptom extraction, triage, hospital matching, or emergency workflows.

---

# 3. Critical Architectural Rule

DO NOT rewrite the existing Alafia backend.

The current backend already has a working voice workflow.

The current flow is:

Voice/text symptom report
→ transcription
→ transcript confirmation
→ symptom extraction
→ deterministic triage
→ facility matching
→ guidance
→ emergency workflow

Only the speech-to-text implementation should change.

The existing endpoint must remain:

POST /api/v1/consultations/:consultationId/voice

The frontend contract should remain compatible.

The frontend must not need to know whether transcription is handled by:

- OpenAI
- Google Cloud
- Self-hosted Whisper

Speech recognition must remain an internal backend integration detail.

---

# 4. Current Voice Architecture

The existing backend currently does the following:

1. Multer receives the uploaded audio.
2. Audio is stored in memory.
3. The audio buffer is sent to the current transcription adapter.
4. Whisper returns a transcript.
5. The backend returns the transcript for confirmation.
6. The frontend/user confirms the transcript.
7. Only after confirmation does symptom extraction and triage continue.

Current endpoint:

POST /api/v1/consultations/:consultationId/voice

Expected multipart fields:

audio
language

The audio should remain in memory.

Do not introduce persistent raw-audio storage.

Do not store raw patient audio in PostgreSQL.

---

# 5. Existing Safety Architecture

This is a healthcare application.

The following separation MUST remain intact:

Speech recognition
→ Language understanding
→ Structured symptoms
→ Deterministic triage
→ Facility matching

Whisper must ONLY perform speech recognition.

Whisper MUST NOT:

- diagnose diseases
- determine severity
- determine emergency status
- recommend hospitals
- generate medical advice
- override triage rules

The deterministic triage engine remains the only authority for severity classification.

For example:

Chest pain + breathing difficulty
→ CRITICAL

Whisper's job ends when it produces the transcript.

---

# 6. Self-Hosted Whisper Architecture

Do NOT run Whisper directly inside the Node.js/Express process.

Use a separate Python service.

Recommended architecture:

alafia/
├── backend/
│   └── Node.js + Express
│
└── whisper-service/
    └── Python + FastAPI + Whisper

Communication:

Node.js backend
→ HTTP request
→ Whisper service
→ transcription
→ HTTP response
→ Node.js backend

The Node.js application remains the main application backend.

The Whisper service is an internal speech-processing microservice.

---

# 7. Recommended Whisper Service Stack

Use:

- Python 3
- FastAPI
- Uvicorn
- Whisper-compatible implementation
- FFmpeg
- Pydantic where appropriate

Prefer a production-friendly Whisper implementation such as faster-whisper if it provides better CPU/GPU efficiency and deployment practicality.

Do not blindly install multiple Whisper implementations.

Choose one implementation and document the reason.

The service should expose a simple internal API:

POST /transcribe

Health endpoint:

GET /health

---

# 8. Whisper Service Responsibilities

The Whisper service should:

1. Receive an audio file.
2. Validate the uploaded file.
3. Temporarily process the audio.
4. Transcribe the audio.
5. Return structured JSON.
6. Delete temporary audio after processing.
7. Never persist raw patient audio.
8. Return useful errors.
9. Support configured languages.
10. Support browser-generated WebM/Opus recordings.

Example successful response:

{
  "success": true,
  "data": {
    "text": "I have severe chest pain and difficulty breathing",
    "language": "en"
  }
}

Do not fabricate a confidence score.

If the chosen Whisper implementation does not provide a reliable confidence metric, return no confidence value or return null.

---

# 9. Audio Handling

The frontend may send browser-recorded audio such as:

WebM + Opus

The Node.js backend currently receives:

req.file.buffer

The backend should forward the audio to the Whisper service without unnecessarily writing it to permanent storage.

The Whisper service may use temporary processing files when required by the selected library.

Any temporary file MUST be deleted after processing.

Do not retain patient audio.

Do not add raw audio columns to the database.

---

# 10. Node.js Integration

Create or update a dedicated speech/transcription adapter.

Do not place Whisper HTTP calls directly inside controllers.

Preferred conceptual structure:

backend/
├── controllers/
├── routes/
├── services/
├── integrations/
│   └── speech/
│       ├── speech.service.js
│       └── whisper.adapter.js
└── ...

Follow the existing project structure if equivalent directories already exist.

The controller should depend on an abstraction such as:

transcribeAudio()

rather than knowing how Whisper works.

Conceptually:

voice controller
→ speech service
→ Whisper adapter
→ Whisper service

---

# 11. Provider Abstraction

Design the speech integration so another provider can be swapped in later.

Example:

SpeechService
    ↓
WhisperAdapter

Future possibilities:

SpeechService
    ↓
OpenAIAdapter

or:

SpeechService
    ↓
GoogleSTTAdapter

The rest of Alafia should not change.

Do not tightly couple the consultation controller to Whisper.

---

# 12. Environment Variables

Add configuration for the Whisper service.

Example:

WHISPER_SERVICE_URL=http://localhost:8001

If authentication between services is implemented, use:

WHISPER_SERVICE_TOKEN=

Do not hard-code:

- localhost URLs
- production URLs
- tokens
- secrets
- model paths

Update the project's environment example file.

Never commit real secrets.

---

# 13. Model Configuration

Do not hard-code the Whisper model in application logic.

Allow configuration.

Example:

WHISPER_MODEL=small

The exact model should be selected based on the deployment hardware.

Possible model sizes include:

tiny
base
small
medium
large

For hackathon deployment, prioritize:

- transcription quality
- latency
- memory usage
- available CPU/GPU
- deployment cost

Do not automatically choose the largest model.

The implementation must document the selected model and why it was chosen.

---

# 14. Nigerian Language Support

Alafia is designed for Nigerian users.

The existing application supports language values such as:

en-NG
pcm
yo-NG
ha-NG
ig-NG

The current mapping includes:

en-NG → en
pcm → en
yo-NG → yo
ha-NG → ha
ig-NG → ig

Preserve this application-level language contract.

However, do not claim that Whisper provides perfect Nigerian-language or Nigerian-Pidgin transcription.

The implementation should gracefully handle unsupported or uncertain language input.

If language detection is used, document it.

Do not silently map every language to English unless that is explicitly part of the current application design.

---

# 15. Transcript Confirmation

The existing transcript confirmation workflow MUST remain.

After transcription:

POST /api/v1/consultations/:consultationId/voice

returns the transcript.

Example:

{
  "success": true,
  "data": {
    "transcript": "I have severe chest pain and difficulty breathing",
    "language": "en-NG",
    "requiresConfirmation": true
  },
  "message": "Audio transcribed; confirmation required"
}

Do not automatically run triage immediately after transcription.

The user must confirm the transcript first.

Existing confirmation endpoint:

POST /api/v1/consultations/:consultationId/confirm-transcript

Only after confirmed=true should symptom extraction and triage continue.

---

# 16. Confidence Handling

Do not invent confidence values.

The previous implementation may return:

"confidence": 0.8

Do not preserve this as a fake value if the self-hosted implementation does not provide a reliable confidence metric.

Preferred:

"confidence": null

or omit the field.

The application should rely on transcript confirmation rather than pretending that the transcription confidence is clinically meaningful.

---

# 17. Error Handling

The Whisper service must return useful errors.

Handle at minimum:

- Missing audio
- Unsupported audio format
- Empty audio
- Corrupted audio
- Audio too large
- Whisper service unavailable
- Transcription timeout
- Model loading failure
- Unsupported language
- Internal Whisper error

The Node.js backend should translate service failures into consistent API errors.

Do not expose Python stack traces to frontend users.

Do not expose internal infrastructure details.

---

# 18. Timeout and Reliability

The Node.js backend must not wait indefinitely for Whisper.

Implement a reasonable request timeout.

If Whisper fails:

Return a controlled error.

Do not continue as though transcription succeeded.

Do not run triage on an incomplete or missing transcript.

The existing text/keyword fallback may continue to operate where appropriate, but do not invent transcript content.

---

# 19. Security Requirements

This is a healthcare application.

Follow these rules:

- Do not persist raw audio.
- Do not log audio contents.
- Do not log sensitive transcripts unnecessarily.
- Do not expose Whisper service publicly unless required.
- Validate uploaded file size.
- Validate MIME type where possible.
- Protect internal Whisper service with a token if deployed across networks.
- Do not commit secrets.
- Do not expose internal service URLs unnecessarily.
- Do not return stack traces.
- Keep temporary files short-lived.

If logs contain transcripts, treat them as sensitive and avoid logging full transcripts in production.

---

# 20. API Contract

The existing frontend-facing endpoint must remain:

POST /api/v1/consultations/:consultationId/voice

Request:

multipart/form-data

Fields:

audio: file
language: string

Response:

{
  "success": true,
  "data": {
    "transcript": "...",
    "language": "en-NG",
    "requiresConfirmation": true
  },
  "message": "Audio transcribed; confirmation required"
}

Do not break the existing response contract unless absolutely necessary.

If changes are required, document them clearly.

---

# 21. Whisper Internal API

Implement:

GET /health

Expected:

{
  "status": "ok"
}

Implement:

POST /transcribe

Request:

multipart/form-data

Field:

audio

Optional:

language

Example response:

{
  "success": true,
  "data": {
    "text": "I have chest pain and difficulty breathing",
    "language": "en"
  }
}

The internal API is not the public Alafia API.

---

# 22. Health Checks

The Node.js backend health check should NOT fail simply because Whisper is temporarily unavailable unless the existing health-check architecture explicitly requires all dependencies to be healthy.

Prefer a separate dependency status if appropriate.

The Whisper service itself must expose:

GET /health

This allows deployment/debugging to verify that:

- Python is running
- FastAPI is running
- Whisper model can load
- FFmpeg is available if required

---

# 23. Testing Requirements

Do not consider this task complete because the server starts.

Test the full voice pipeline.

Minimum test:

Audio
→ Node.js
→ Whisper
→ Transcript
→ Confirmation
→ Symptoms
→ Triage

Test cases:

### Test 1 — Critical

Audio transcript should represent:

"I have severe chest pain and difficulty breathing."

Expected:

CRITICAL

### Test 2 — Medium

Audio transcript should represent:

"I have a cough and fever."

Expected:

MEDIUM

### Test 3 — Low

Audio transcript should represent a mild symptom such as:

"I have a mild rash."

Expected:

LOW

### Test 4 — Nigerian English

Use a naturally spoken Nigerian English recording.

Verify transcription quality.

### Test 5 — Unsupported/corrupt audio

Ensure the service returns a controlled error.

### Test 6 — Empty audio

Ensure no crash.

### Test 7 — Whisper unavailable

Stop the Whisper service and verify Node.js returns a controlled dependency error.

### Test 8 — Transcript confirmation

Verify that triage does NOT run before confirmation.

---

# 24. Golden Path

The implementation must preserve this exact golden path:

Create guest session
→ Create consultation
→ Upload voice
→ Whisper transcription
→ Return transcript
→ User confirms transcript
→ Extract symptoms
→ Normalize symptoms
→ Store symptoms
→ Run deterministic triage
→ Determine severity
→ Calculate required capabilities
→ Recommend facility
→ Select facility
→ Activate Emergency Mode if CRITICAL
→ Generate emergency summary
→ Create handoff record

Do not bypass transcript confirmation.

Do not let Whisper determine severity.

---

# 25. Existing Features That Must Not Break

Do not break:

- Authentication
- Guest sessions
- Consultations
- Consultation messages
- Symptom extraction
- Symptom normalization
- Triage
- Red-flag detection
- Guidance
- Facility matching
- Hospital recommendations
- Hospital selection
- Emergency Mode
- Emergency summaries
- Emergency handoff
- Provider records
- Database persistence
- YarnGPT integration
- Existing API contracts

Run existing tests and relevant endpoint checks after implementation.

---

# 26. Database Rules

Do not create database tables for Whisper unless genuinely necessary.

Whisper transcription itself should not require persistent storage.

Do not store:

- Raw audio
- Temporary audio paths
- Whisper model data

The existing consultation message/transcript persistence remains responsible for the confirmed transcript.

---

# 27. Logging

Use structured logging where the existing backend supports it.

Good:

"Whisper transcription requested"
"Whisper transcription completed"
"Whisper transcription failed"

Avoid:

"User said: I have severe chest pain..."

Do not unnecessarily log sensitive patient speech.

Never log:

- API keys
- tokens
- authorization headers
- raw audio
- complete sensitive patient records

---

# 28. Deployment Considerations

The implementation must be deployable independently from the Node.js backend.

Recommended:

Node.js API
+
Whisper service

The deployment environment must have enough resources for the selected Whisper model.

Before deployment, document:

- Python version
- Whisper implementation
- Model size
- CPU/RAM requirements
- GPU requirements if applicable
- FFmpeg requirement
- Port
- Environment variables
- Startup command

Do not assume Render, Vercel, or another provider supports GPU inference.

If the chosen hosting provider cannot practically run Whisper, document an alternative architecture rather than forcing it into an unsuitable environment.

---

# 29. Development Commands

Document commands such as:

Whisper service:

python -m venv .venv

Windows:

.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run:

uvicorn app:app --host 0.0.0.0 --port 8001

Node.js backend:

npm run dev

The exact commands should match the final implementation.

---

# 30. Documentation Requirements

Update or create documentation covering:

1. Architecture
2. Why self-hosted Whisper is used
3. Whisper implementation selected
4. Model selected
5. Environment variables
6. Local setup
7. Running Whisper service
8. Running Node.js backend
9. API contracts
10. Testing
11. Deployment
12. Limitations
13. Language support
14. Security/privacy considerations

Do not claim medical-grade accuracy.

Do not claim perfect Nigerian-language recognition.

Do not claim that Whisper diagnoses patients.

---

# 31. Implementation Strategy

Follow this order:

### Step 1

Inspect the existing repository.

Understand:

- current voice controller
- current routes
- current OpenAI adapter
- current service architecture
- environment configuration
- existing error handling
- existing tests

Do not modify files blindly.

### Step 2

Identify the existing speech abstraction.

If an abstraction already exists, extend it.

Do not create a duplicate speech service.

### Step 3

Create the Python Whisper service.

Implement:

GET /health

POST /transcribe

### Step 4

Test Whisper independently.

Verify:

audio file
→ Whisper
→ transcript

before integrating it with Node.js.

### Step 5

Create/update the Node.js Whisper adapter.

The adapter should:

- receive Buffer
- create multipart request
- send to Whisper service
- parse response
- normalize response
- handle errors
- return transcript

### Step 6

Replace the current OpenAI transcription dependency in the voice flow.

Do not remove unrelated OpenAI functionality.

OpenAI may still be used elsewhere in the application.

Only replace the transcription provider.

### Step 7

Run the complete golden path.

### Step 8

Run regression tests.

### Step 9

Update documentation.

### Step 10

Report exactly what changed.

---

# 32. Do NOT Do These Things

Do not:

- Rewrite the entire backend.
- Rewrite the voice controller unnecessarily.
- Remove transcript confirmation.
- Move triage into Whisper.
- Use an LLM to determine medical severity.
- Store raw patient audio.
- Hard-code Whisper URLs.
- Hard-code secrets.
- Commit model files unnecessarily.
- Install several competing Whisper libraries without reason.
- Introduce a database dependency for transcription.
- Modify unrelated hospital/emergency logic.
- Break the existing frontend API contract.
- Fake confidence scores.
- Claim hospital readiness from static facility data.
- Claim real-time hospital capacity unless real provider data exists.
- Claim Whisper guarantees Nigerian-language accuracy.

---

# 33. Definition of Done

This task is complete only when all of the following are true:

[ ] Self-hosted Whisper service exists.

[ ] Whisper service runs independently.

[ ] GET /health works.

[ ] POST /transcribe works.

[ ] Browser-generated WebM/Opus audio can be transcribed.

[ ] Node.js backend can communicate with Whisper.

[ ] Existing POST /api/v1/consultations/:id/voice still works.

[ ] Transcript is returned to the frontend.

[ ] Transcript confirmation still works.

[ ] Symptoms are not extracted before confirmation.

[ ] Deterministic triage still works.

[ ] CRITICAL red flags still work.

[ ] Hospital matching still works.

[ ] Emergency workflow still works.

[ ] YarnGPT integration remains unaffected.

[ ] Raw audio is not persisted.

[ ] Sensitive audio/transcript data is not unnecessarily logged.

[ ] Whisper failures produce controlled errors.

[ ] Environment variables are documented.

[ ] Local setup is documented.

[ ] Deployment requirements are documented.

[ ] Existing backend functionality remains intact.

[ ] Full golden path has been tested.

---

# 34. Final Architectural Principle

ALAFIA IS NOT A DIAGNOSTIC CHATBOT.

Its architecture is:

Voice
→ Transcription
→ User confirmation
→ Symptom extraction
→ Deterministic safety rules
→ Triage
→ Facility matching
→ Guidance
→ Emergency coordination

Whisper is ONLY the speech-recognition layer.

The medical safety engine remains deterministic.

Never allow the transcription model or a general-purpose AI model to override the deterministic safety rules.

Build the smallest reliable change necessary to replace the current OpenAI Whisper API dependency with self-hosted Whisper while preserving the existing Alafia architecture and API contracts.