FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    WHISPER_DEVICE=cpu \
    WHISPER_COMPUTE_TYPE=int8

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Run unprivileged.
RUN useradd --create-home appuser
USER appuser

# Model size is fixed at build time and baked into the image so cold starts
# do not download from Hugging Face at runtime.
# Override with: docker build --build-arg WHISPER_MODEL=base .
ARG WHISPER_MODEL=small
ENV WHISPER_MODEL=${WHISPER_MODEL}
RUN python -c "from faster_whisper import WhisperModel; WhisperModel('${WHISPER_MODEL}', device='cpu', compute_type='int8')"

EXPOSE 8001

# start-period covers model load; /health returns 200 once ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=3 \
  CMD python -c "import urllib.request,sys; sys.exit(0 if urllib.request.urlopen('http://127.0.0.1:8001/health', timeout=4).status == 200 else 1)"

# One worker: all requests must share a single model instance.
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
