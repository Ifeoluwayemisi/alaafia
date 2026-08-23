# ALAFIA Whisper Service

Self-hosted speech-to-text microservice for ALAFIA. It converts patient audio
into text **only**. It does not diagnose, classify severity, generate medical
advice, or participate in triage decisions — the deterministic triage engine in
the Node.js backend remains the only authority for severity.

## Architecture

```
Patient → Frontend records audio
        → POST /api/v1/consultations/:id/voice   (Node.js backend)
        → SpeechService.transcribeAudio()         (backend/src/integrations/speech/)
        → WhisperAdapter → HTTP multipart         (WHISPER_SERVICE_URL)
        → THIS SERVICE  → faster-whisper          (separate Python process)
        → transcript JSON back to the backend
        → transcript returned to the user for confirmation
```

- The service runs as an independent process (`uvicorn`), never inside the
  Node.js/Express process.
- The frontend never talks to this service directly; speech recognition is an
  internal backend integration detail.
- Raw audio lives only in memory (Node side) and a temporary file (this side)
  that is deleted in a `finally` block after every request. Nothing is
  persisted, logged, or stored in the database.

## Why self-hosted Whisper

- No patient audio leaves the deployment boundary.
- No per-minute transcription billing.
- Provider can be swapped behind the `SpeechService` abstraction without
  touching controllers or the frontend.

## Implementation selected: faster-whisper

[faster-whisper](https://github.com/SYSTRAN/faster-whisper) is a reimplementation
of OpenAI's Whisper using CTranslate2. Chosen over alternatives because:

- ~4x faster than openai/whisper on CPU with int8 quantization, with lower RAM
  usage — important for hackathon/CPU-only deployment.
- Drop-in Whisper behaviour (same models, same language coverage).
- Single well-maintained dependency instead of multiple competing libraries.

Audio decoding is handled by PyAV (bundled FFmpeg libraries ship inside its
wheels). A system-wide FFmpeg install is therefore optional on Windows/macOS;
on slim Linux images install `ffmpeg` if decoding of exotic containers fails.

## Model selected: `small`

Default: `WHISPER_MODEL=small` (`~460 MB`, int8 CPU).

| Model | Relative speed | Accuracy | When to use |
|---|---|---|---|
| tiny / base | fastest | lowest | only if RAM < 2 GB |
| **small** | moderate | good | **default** — best quality/latency balance for Nigerian-accented English on CPU |
| medium / large-v3 | slow | best | GPU deployments only |

Rationale: hackathon hardware is CPU-only; `small` keeps transcription latency
acceptable while handling Nigerian English accents noticeably better than
`base`. It is configurable — do not change code to switch models.

## Environment variables

Configured via `.env` in this directory (see `.env.example`) or process env:

| Variable | Default | Purpose |
|---|---|---|
| `WHISPER_MODEL` | `small` | Model size: tiny, base, small, medium, large-v3 |
| `WHISPER_DEVICE` | `cpu` | `cpu`, `cuda`, or `auto` |
| `WHISPER_COMPUTE_TYPE` | `int8` | `int8` for CPU, `float16` for GPU |
| `WHISPER_SERVICE_TOKEN` | *(empty)* | Shared secret; when set, requests must send `Authorization: Bearer <token>` |
| `MAX_UPLOAD_MB` | `25` | Upload size limit |
| `LOG_LEVEL` | `INFO` | Logging verbosity |

Node-side variables live in `backend/.env`: `WHISPER_SERVICE_URL`,
`WHISPER_SERVICE_TOKEN`, `WHISPER_TIMEOUT_MS`.

Never commit real secrets.

## Local setup

Requires Python 3.10+.

```powershell
cd whisper-service
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env        # optional; defaults work locally
```

Run (from `whisper-service/` with venv active):

```powershell
uvicorn app:app --host 0.0.0.0 --port 8001
```

The first startup downloads the model from Hugging Face and loads it before the
API accepts traffic (a failed model load aborts startup rather than serving
errors later).

Then run the Node backend as usual (`cd backend && npm run dev`) — it proxies
transcription to `WHISPER_SERVICE_URL`.

## Internal API contract

This API is internal infrastructure, not the public ALAFIA API.

### `GET /health`

```json
{ "status": "ok", "model": "small", "device": "cpu" }
```

Returns `503 {"status": "loading"}` if the model is not ready yet.

### `POST /transcribe`

Request: `multipart/form-data` with field `audio` (file) and optional `language`
(two-letter code such as `en`, `yo`; anything else triggers auto-detection).

```json
{
  "success": true,
  "data": {
    "text": "I have severe chest pain and difficulty breathing",
    "language": "en"
  }
}
```

No confidence value is returned: faster-whisper's log-probability metrics are
not a reliable user-facing confidence score, and ALAFIA relies on explicit
transcript confirmation instead.

Errors always use:

```json
{ "success": false, "error": { "code": "...", "message": "..." } }
```

| Code | HTTP | Cause |
|---|---|---|
| `MISSING_AUDIO` / `EMPTY_AUDIO` | 400 | No file or empty upload |
| `UNSUPPORTED_AUDIO_FORMAT` | 400 | Extension not in allow-list |
| `AUDIO_TOO_LARGE` | 413 | Over `MAX_UPLOAD_MB` |
| `UNAUTHORIZED` | 401 | Token configured but missing/wrong |
| `TRANSCRIPTION_FAILED` | 422 | Corrupt/undecodable audio |
| `ERROR` | 500 | Unexpected failure (details logged server-side only) |

### Public ALAFIA contract (unchanged)

The frontend-facing endpoint remains `POST /api/v1/consultations/:id/voice`
returning `{ transcript, language, requiresConfirmation: true }`. Only two
observable changes were made there: `confidence` is now `null` instead of a
fabricated number, and dependency failures return controlled `503`
(`TRANSCRIPTION_UNAVAILABLE`) / `504` (`TRANSCRIPTION_TIMEOUT`) responses
instead of a generic `422`.

## Testing checklist

With both services running:

1. **Critical**: audio saying "I have severe chest pain and difficulty breathing"
   → confirm → triage returns CRITICAL.
2. **Medium**: "I have a cough and fever." → MEDIUM.
3. **Low**: "I have a mild rash." → LOW.
4. **Nigerian English**: record naturally and inspect transcript quality.
5. **Corrupt audio**: upload random bytes → `400/422 TRANSCRIPTION_FAILED`,
   no crash.
6. **Empty audio**: zero-byte file → `400 EMPTY_AUDIO`.
7. **Whisper unavailable**: stop uvicorn, retry `/voice` → backend responds
   `503 TRANSCRIPTION_UNAVAILABLE` (controlled error, no hang).
8. **Transcript confirmation**: verify triage does not run until
   `/confirm-transcript` is called with `confirmed=true`.

## Deployment notes

### Render blueprint (one-click)

A `render.yaml` at the repo root defines this service for Render's Python
runtime (plan: `standard`, 2 GB — required for `small`; use `base` on
512 MB plans). Deploy via **New → Blueprint** in the Render dashboard; it
will prompt for `WHISPER_SERVICE_TOKEN`. Set the same token plus
`WHISPER_SERVICE_URL` / `WHISPER_TIMEOUT_MS=60000` in the backend service.

### Docker

Build (model baked into the image at build time):

```bash
docker build -t alafia-whisper ./whisper-service
# different model size:
docker build --build-arg WHISPER_MODEL=base -t alafia-whisper ./whisper-service
```

Run (bound to localhost only by default):

```bash
docker run -d --name alafia-whisper \
  -p 127.0.0.1:8001:8001 \
  -e WHISPER_SERVICE_TOKEN=change-me \
  --memory=2g \
  alafia-whisper

curl http://127.0.0.1:8001/health
```

On Railway/Render/Fly.io, point their Docker deploy at `whisper-service/`;
mark the service private/internal and set `WHISPER_SERVICE_TOKEN` on both
sides. The container health check uses `/health` with a 3-minute startup
grace period for model loading.

- Deploy as a separate service from the Node.js API (independent container/process).
- CPU-only sizing for `small` int8: ~1 GB RAM free plus ~2 GB during first-run
  download; one worker (`--workers 1`) so all requests share one model instance.
- CPU-only inference takes seconds per request; requests are processed one at
  a time (single model instance), so concurrent uploads queue and multiply
  latency. Keep `WHISPER_TIMEOUT_MS` at `60000` or above on CPU — WebM/Opus
  decoding measured ~27 s per short clip idle on a consumer laptop, exceeding
  the previous 30 s default under load.
- GPU is optional; set `WHISPER_DEVICE=cuda` and `WHISPER_COMPUTE_TYPE=float16`.
  Do not assume hosted PaaS platforms provide GPU inference — if the target
  host cannot run the model, keep transcription provider-swappable via
  `SpeechService` and point it at a remote GPU box or managed STT instead.
- Protect with `WHISPER_SERVICE_TOKEN` whenever the service is reachable beyond
  localhost; keep the port internal (not exposed publicly).
- Set `WHISPER_TIMEOUT_MS` (backend) below your platform's request timeout.

## Language support

Application-level codes are preserved at the API boundary:
`en-NG → en`, `pcm → en`, `yo-NG → yo`, `ha-NG → ha`, `ig-NG → ig`.

Honest limitations: Whisper was not trained primarily on Nigerian Pidgin and
has limited Yoruba/Hausa/Igbo accuracy. Transcripts may be imperfect; that is
why the confirmation step exists. Unknown language codes fall back to
auto-detection rather than failing.

## Security & privacy

- Audio is processed in temporary files deleted after each request; nothing is
  persisted or written to the database.
- Transcripts are never logged by this service or the backend adapter; logs
  contain sizes, language codes, durations, and status only.
- Stack traces stay in server logs; API errors expose stable codes and short
  messages only.
- Validate upload size/format at both layers (multer on Node, this service).
