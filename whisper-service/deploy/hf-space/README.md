---
title: Alafia Whisper STT
emoji: 🩺
colorFrom: blue
colorTo: purple
sdk: docker
app_port: 8001
pinned: false
---

# Alafia Whisper — self-hosted speech-to-text

Internal transcription microservice for [Alafia](https://github.com/) (voice-first
healthcare triage). FastAPI + faster-whisper (`small`, int8, CPU). Performs
**speech recognition only** — never diagnosis, triage, or medical advice.

This folder is a ready-to-upload Hugging Face Space package. Upload these four
files to a new **Docker** Space:

- `Dockerfile`
- `app.py`
- `requirements.txt`
- `README.md` (this file)

## Configuration

Set as a Space **secret** (Settings → Variables and secrets):

| Secret | Required | Purpose |
|---|---|---|
| `WHISPER_SERVICE_TOKEN` | Recommended | Bearer token required by `/transcribe`; `/health` stays open |

Optional variables (defaults shown): `WHISPER_MODEL=small`, `WHISPER_DEVICE=cpu`,
`WHISPER_COMPUTE_TYPE=int8`, `MAX_UPLOAD_MB=25`, `LOG_LEVEL=INFO`.
Changing `WHISPER_MODEL` applies on the next container start; it has no
effect on an already-running model instance.

## Connecting the Alafia backend

In `backend/.env`:

```env
WHISPER_SERVICE_URL=https://<your-username>-alafia-whisper.hf.space
WHISPER_SERVICE_TOKEN=<same value as the Space secret>
WHISPER_TIMEOUT_MS=60000
```

## API

- `GET /health` → `{"status": "ok", ...}` once the model is loaded
- `POST /transcribe` (multipart: `audio`, optional `language`) with
  `Authorization: Bearer <token>` → `{"success": true, "data": {"text": "...", "language": "..."}}`

## Notes & limits

- Free CPU tier: expect ~10–30 s per short clip; requests queue (one model instance).
- Space sleeps after ~48 h idle; first request after sleep reloads the model (~30–60 s).
- Raw audio is processed in temporary files deleted immediately after transcription;
  nothing is persisted.
