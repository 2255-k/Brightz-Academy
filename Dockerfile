# ==============================================================================
# Unified Production Multi-Stage Dockerfile for Bright Mindz Academy
# Builds both the React SPA Frontend and Django REST Framework Backend
# Into a Single Self-Contained High-Performance Container with Nginx + Gunicorn
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build React (TypeScript + Vite) Frontend Single Page Application
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Cache npm dependencies layer
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

# Copy frontend source code and compile production assets
COPY frontend/ ./
ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Python 3.12 Runtime with Django, Gunicorn, Nginx & Supervisord
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runtime

# Python optimization flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=80 \
    APP_HOME=/app

WORKDIR ${APP_HOME}

# Install essential system libraries for PostgreSQL, Pillow, Nginx & Supervisor
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    libjpeg-dev \
    zlib1g-dev \
    curl \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install backend Python dependencies
COPY backend/requirements.txt ${APP_HOME}/backend/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r ${APP_HOME}/backend/requirements.txt

# Copy Django backend source code
COPY backend/ ${APP_HOME}/backend/

# Copy compiled frontend SPA from Stage 1 into Nginx web root
COPY --from=frontend-builder /app/frontend/dist /var/www/frontend

# Configure Nginx reverse proxy
RUN rm -f /etc/nginx/sites-enabled/default /etc/nginx/conf.d/default.conf
COPY docker/nginx/nginx.unified.conf /etc/nginx/conf.d/default.conf

# Configure Supervisor process manager & unified entrypoint
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint-unified.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN sed -i '1s/^\xEF\xBB\xBF//; s/\r$//' /entrypoint.sh && (head -1 /entrypoint.sh | grep -q '^#!' || sed -i '1i #!/bin/sh' /entrypoint.sh)

# Prepare runtime volume and log directories
RUN mkdir -p /app/backend/staticfiles \
             /app/backend/media \
             /var/log/supervisor \
             /var/log/nginx

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
