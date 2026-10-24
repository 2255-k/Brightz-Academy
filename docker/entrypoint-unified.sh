#!/bin/sh
set -e
cd /app/backend

echo "Waiting for database..."
python - << 'PY'
import os, socket, time
host = os.getenv("DB_HOST", "localhost")
port = int(os.getenv("DB_PORT", "5432"))
for _ in range(60):
    try:
        socket.create_connection((host, port), timeout=2).close()
        print("Database is up")
        break
    except OSError:
        time.sleep(1)
PY

python manage.py migrate --noinput
python manage.py collectstatic --noinput || true

exec "$@"
