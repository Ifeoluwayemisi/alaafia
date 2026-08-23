"""ALAFIA self-hosted Whisper speech-to-text service.

Internal microservice. Performs speech recognition ONLY:
no diagnosis, no severity classification, no medical advice.

Endpoints:
    GET  /health
    POST /transcribe   (multipart/form-data: audio, optional language)

Raw audio is processed in temporary files that are deleted after every
request. Nothing is persisted.
"""

import logging
import os
import tempfile
import time

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)
logger = logging.getLogger("alafia.whisper")

WHISPER_MODEL = os.getenv("WHISPER_MODEL", "small")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
WHISPER_SERVICE_TOKEN = os.getenv("WHISPER_SERVICE_TOKEN", "").strip()
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "25"))
MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024

# Browser recordings and common audio containers accepted for decoding.
SUPPORTED_EXTENSIONS = {
    ".webm",
    ".wav",
    ".mp3",
    ".m4a",
    ".ogg",
    ".opus",
    ".flac",
    ".mp4",
    ".aac",
}

model = None


class ServiceError(HTTPException):
    """HTTP error carrying a stable machine-readable code."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail=message)
        self.code = code


def _load_model():
    """Load the model eagerly so /health reports real readiness."""
    global model
    from faster_whisper import WhisperModel

    started = time.monotonic()
    logger.info(
        "Loading Whisper model=%s device=%s compute_type=%s",
        WHISPER_MODEL,
        WHISPER_DEVICE,
        WHISPER_COMPUTE_TYPE,
    )
    model = WhisperModel(
        WHISPER_MODEL,
        device=WHISPER_DEVICE,
        compute_type=WHISPER_COMPUTE_TYPE,
    )
    logger.info("Whisper model loaded in %.1fs", time.monotonic() - started)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        _load_model()
    except Exception:
        # Fail fast: a speech service without its model is useless, and a
        # clean startup failure is easier to operate than runtime 500s.
        logger.exception("Fatal: failed to load Whisper model")
        raise
    yield


app = FastAPI(title="Alafia Whisper Service", version="1.0.0", lifespan=lifespan)


@app.exception_handler(ServiceError)
@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_request: Request, exc: StarletteHTTPException):
    """Consistent error envelope; never leaks stack traces."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": getattr(exc, "code", None) or "ERROR",
                "message": str(exc.detail),
            },
        },
    )


def _require_auth(request: Request) -> None:
    if not WHISPER_SERVICE_TOKEN:
        return
    header = request.headers.get("authorization", "")
    if header != f"Bearer {WHISPER_SERVICE_TOKEN}":
        raise ServiceError(401, "UNAUTHORIZED", "Invalid or missing service token")


@app.get("/health")
async def health():
    if model is None:
        return JSONResponse(
            status_code=503,
            content={"status": "loading", "model": WHISPER_MODEL},
        )
    return {
        "status": "ok",
        "model": WHISPER_MODEL,
        "device": WHISPER_DEVICE,
    }


def _normalize_language(language: str | None) -> str | None:
    """Accept ISO-639-1 primary codes (e.g. en, yo); anything else means
    'let Whisper auto-detect'. Regional codes such as en-NG are mapped to
    their primary subtag by the Node backend before they arrive here.
    """
    if not language:
        return None
    candidate = language.strip().split("-")[0].lower()
    if len(candidate) == 2 and candidate.isalpha():
        return candidate
    return None


def _delete_temp(path: Path | None) -> None:
    if path is None:
        return
    try:
        path.unlink(missing_ok=True)
    except OSError:
        logger.warning("Could not delete temp file %s", path.name)


async def _read_upload_to_temp(upload: UploadFile) -> tuple[Path, int]:
    extension = Path(upload.filename or "").suffix.lower()
    if extension and extension not in SUPPORTED_EXTENSIONS:
        raise ServiceError(
            400,
            "UNSUPPORTED_AUDIO_FORMAT",
            f"Unsupported audio format '{extension}'; supported: "
            + ", ".join(sorted(SUPPORTED_EXTENSIONS)),
        )

    suffix = extension or ".webm"
    tmp_path = None
    bytes_written = 0
    try:
        handle = tempfile.NamedTemporaryFile(prefix="alafia-", suffix=suffix, delete=False)
        tmp_path = Path(handle.name)
        with handle:
            while chunk := await upload.read(1024 * 1024):
                bytes_written += len(chunk)
                if bytes_written > MAX_UPLOAD_BYTES:
                    raise ServiceError(
                        413,
                        "AUDIO_TOO_LARGE",
                        f"Audio exceeds the {MAX_UPLOAD_MB} MB limit",
                    )
                handle.write(chunk)
    except ServiceError:
        _delete_temp(tmp_path)
        raise
    except Exception:
        _delete_temp(tmp_path)
        logger.exception("Failed while receiving upload")
        raise ServiceError(400, "INVALID_UPLOAD", "Failed to read upload")

    if bytes_written == 0:
        _delete_temp(tmp_path)
        raise ServiceError(400, "EMPTY_AUDIO", "Audio file is empty")

    logger.info("Upload received bytes=%s extension=%s", bytes_written, suffix)
    return tmp_path, bytes_written


def _run_transcription(path: Path, language: str | None):
    segments, info = model.transcribe(str(path), language=language, beam_size=5)
    text = "".join(segment.text for segment in segments).strip()
    return text, info


@app.post("/transcribe")
async def transcribe(
    request: Request,
    audio: UploadFile = File(...),
    language: str | None = None,
):
    _require_auth(request)

    tmp_path, upload_size = await _read_upload_to_temp(audio)
    whisper_language = _normalize_language(language)
    started = time.monotonic()

    try:
        text, info = _run_transcription(tmp_path, whisper_language)
    except ValueError as exc:
        if not whisper_language:
            logger.warning("Transcription failed: %s", str(exc)[:160])
            _delete_temp(tmp_path)
            raise ServiceError(
                422, "TRANSCRIPTION_FAILED", "Audio could not be decoded or transcribed"
            )
        # Unknown/unsupported language values surface as ValueError;
        # fall back to auto-detection instead of failing the request.
        logger.warning(
            "Language '%s' not usable (%s); retrying with auto-detect",
            whisper_language,
            str(exc)[:120],
        )
        whisper_language = None
        try:
            text, info = _run_transcription(tmp_path, None)
        except Exception:
            logger.exception("Audio could not be decoded or transcribed")
            _delete_temp(tmp_path)
            raise ServiceError(
                422, "TRANSCRIPTION_FAILED", "Audio could not be decoded or transcribed"
            )
    except Exception:
        logger.exception("Audio could not be decoded or transcribed")
        _delete_temp(tmp_path)
        raise ServiceError(
            422, "TRANSCRIPTION_FAILED", "Audio could not be decoded or transcribed"
        )

    _delete_temp(tmp_path)

    detected = getattr(info, "language", None)
    logger.info(
        "Transcription completed bytes=%s requested_language=%s detected_language=%s duration_ms=%s",
        upload_size,
        whisper_language or "auto",
        detected,
        int((time.monotonic() - started) * 1000),
    )

    return {
        "success": True,
        "data": {
            "text": text,
            "language": detected or whisper_language or "en",
        },
    }
