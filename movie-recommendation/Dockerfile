# Stage 1: Builder
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Tạo thư mục cache cho model ngay trong thư mục app
# Để copy nó sang stage cuối, giúp khởi động cực nhanh trên HF
RUN mkdir -p /app/model_cache
ENV TRANSFORMERS_CACHE=/app/model_cache
ENV SENTENCE_TRANSFORMERS_HOME=/app/model_cache

RUN python -c "from sentence_transformers import SentenceTransformer; \
    print('Downloading model to /app/model_cache...'); \
    model = SentenceTransformer('all-MiniLM-L6-v2', cache_folder='/app/model_cache'); \
    print('Model cached successfully!')"

# Stage 2: Final
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy toàn bộ môi trường python đã cài đặt
COPY --from=builder /usr/local /usr/local
# Copy thư mục model đã được tải sẵn
COPY --from=builder /app/model_cache /app/model_cache

COPY ./app ./app
COPY ./main.py .

# Cấu hình môi trường để app tìm thấy model tại thư mục đã copy
ENV TRANSFORMERS_CACHE=/app/model_cache
ENV SENTENCE_TRANSFORMERS_HOME=/app/model_cache
ENV PYTHONUNBUFFERED=1

# Hugging Face yêu cầu User UID 1000 để phân quyền chính xác
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser

EXPOSE 7860

# Healthcheck giúp HF Spaces biết app đã online và sẵn sàng nhận traffic
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:7860/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
