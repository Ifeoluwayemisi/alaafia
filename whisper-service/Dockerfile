FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HF_HOME=/home/appuser/.cache/huggingface \
    WHISPER_MODEL=small \
    WHISPER_DEVICE=cpu \
    WHISPER_COMPUTE_TYPE=int8

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Run unprivileged.
RUN useradd --create-home appuser
USER appuser

# The model is intentionally not downloaded during docker build. app.py loads
# it once at container startup, then reuses that instance for every request.
# Mount /home/appuser/.cache/huggingface to retain the download across
# container recreation. WHISPER_MODEL remains runtime-configurable.

EXPOSE 8001

# Runtime model download can take several minutes; /health returns 200 only
# after the model is loaded and ready.
# Shell-form so ${PORT:-8001} is expanded: Railway may inject PORT.
HEALTHCHECK --interval=30s --timeout=5s --start-period=600s --retries=3 \
  CMD sh -c 'python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen(\"http://127.0.0.1:'"${PORT:-8001}"'/health\", timeout=4).status == 200 else 1)"'

# One worker: all requests must share a single model instance.
# Shell-form CMD so Railway-injected $PORT is honored (defaults to 8001).
CMD ["sh", "-c", "exec uvicorn app:app --host 0.0.0.0 --port \"${PORT:-8001}\" --workers 1"]
