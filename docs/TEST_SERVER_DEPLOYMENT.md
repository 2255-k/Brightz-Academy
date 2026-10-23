# Test Server (Staging VPS) Deployment Guide — Bright Mindz Academy

This guide provides end-to-end instructions for deploying the **Bright Mindz Academy** platform to any Linux Cloud VPS (Ubuntu 22.04 / 24.04 LTS or Debian 11 / 12) on AWS, DigitalOcean, Hetzner, Linode, or Hostinger.

The staging environment is pre-configured to run over HTTP on port 80 directly on your **Server IP address** (e.g. `http://<SERVER_IP>/`), allowing immediate client demonstration, testing, and acceptance without requiring live domain DNS or SSL certificates.

---

## 1. Cloud VPS Prerequisites

- **Operating System:** Ubuntu 22.04 LTS / 24.04 LTS (recommended) or Debian 11 / 12.
- **Hardware Specs:** Minimum 2 GB RAM (4 GB recommended), 1–2 vCPUs, 20 GB SSD storage.
- **Firewall / Security Group Inbound Rules:**
  - `SSH` (Port 22) — TCP (your IP or anywhere)
  - `HTTP` (Port 80) — TCP (Anywhere `0.0.0.0/0`)
  - `HTTPS` (Port 443) — TCP (Optional, for future production SSL)

---

## 2. Fast-Track Deployment (One-Command Script)

Log into your VPS via SSH:
```bash
ssh root@<YOUR_SERVER_IP>
```

### Step 1: Clone or Copy the Repository
```bash
git clone <YOUR_GIT_REPO_URL> /var/www/brightmindz
cd /var/www/brightmindz
```
*(If you are copying files directly from your workstation instead of git, see Section 4 below).*

### Step 2: Make the Deployment Script Executable and Run
```bash
chmod +x scripts/deploy_staging.sh
./scripts/deploy_staging.sh
```

**What the script does automatically:**
1. Installs Docker Engine and the Docker Compose plugin (if not already installed).
2. Generates `.env.staging` with staging security defaults (allowing IP access, disabling HTTPS redirect).
3. Builds the React SPA production frontend container and the Django backend container.
4. Launches PostgreSQL 16, backend, frontend, and Nginx reverse proxy containers.
5. Runs database migrations (`manage.py migrate`) and collects static files (`manage.py collectstatic`).
6. Seeds all courses, modules, lessons, trainers, FAQs, testimonials, and demo accounts (`populate_brightmindz_demo`).
7. Creates the superuser `admin@brightmindzacademy.com`.
8. Verifies API health and prints your staging URLs.

---

## 3. Manual Deployment (Step-by-Step)

If you prefer executing each step manually:

### Step 1: Install Docker & Docker Compose
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 2: Configure Staging Environment File
Create `.env.staging` in the project root:
```bash
cat << 'EOF' > .env.staging
DEBUG=False
SECRET_KEY=brightmindz-staging-vps-test-secret-2026
ALLOWED_HOSTS=*
CORS_ALLOW_ALL_ORIGINS=True
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

DB_ENGINE=postgres
DB_NAME=brightmindz_staging_db
DB_USER=brightmindz_user
DB_PASSWORD=staging_postgres_password_123
DB_HOST=db
DB_PORT=5432

RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=rzp_test_secret_placeholder
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_secret_placeholder
VIDEO_PROVIDER=mock
WHATSAPP_PHONE_NUMBER=919846000000
EOF
```

### Step 3: Build and Launch Containers
```bash
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
```

### Step 4: Populate Demo Courses and Accounts
```bash
# Seed courses, lessons, trainers, testimonials
docker compose -f docker-compose.staging.yml exec backend python manage.py populate_brightmindz_demo

# Create admin superuser
docker compose -f docker-compose.staging.yml exec backend python manage.py createsuperuser --email admin@brightmindzacademy.com --noinput
```
*(Or reset password via `docker compose -f docker-compose.staging.yml exec backend python manage.py changepassword admin@brightmindzacademy.com`)*

---

## 4. Transferring Code Directly from Local Machine (Rsync / SCP)

If you haven't pushed to a remote git repository yet, you can rsync the project from your local computer:

```bash
# From your local terminal (Windows PowerShell or Git Bash):
rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.git' --exclude 'staticfiles' \
  c:/Users/User/Desktop/BRIGHTz/ root@<YOUR_SERVER_IP>:/var/www/brightmindz/
```

Or using SCP:
```bash
scp -r c:/Users/User/Desktop/BRIGHTz root@<YOUR_SERVER_IP>:/var/www/brightmindz
```

Then SSH into the VPS and run `scripts/deploy_staging.sh`.

---

## 5. Accessing the Staging Platform

Once deployed, open your browser and navigate to:

| Service | Staging URL | Purpose |
| :--- | :--- | :--- |
| **Main Website & LMS** | `http://<YOUR_SERVER_IP>/` | Student portal, course catalog, lessons, admissions |
| **REST API** | `http://<YOUR_SERVER_IP>/api/courses/` | Public course endpoints & JSON data |
| **Django Admin** | `http://<YOUR_SERVER_IP>/admin/` | Content management, enrollments, trainers, payments |

### Pre-Configured Test Credentials

| Account Role | Email | Password |
| :--- | :--- | :--- |
| **Academy Administrator** | `admin@brightmindzacademy.com` | `AdminPass123!` |
| **Student (Enrolled)** | `student@brightmindzacademy.com` | `StudentPass123!` |

---

## 6. Daily Maintenance Commands

### View Real-Time Container Logs
```bash
docker compose -f docker-compose.staging.yml logs -f
# Or specific service:
docker compose -f docker-compose.staging.yml logs -f backend
docker compose -f docker-compose.staging.yml logs -f nginx
```

### Restart Staging Services
```bash
docker compose -f docker-compose.staging.yml restart
```

### Rebuild After Code Changes
```bash
git pull
docker compose -f docker-compose.staging.yml up -d --build
```

### Run Django Commands Inside Container
```bash
# Run tests inside container
docker compose -f docker-compose.staging.yml exec backend python manage.py test

# Database shell
docker compose -f docker-compose.staging.yml exec backend python manage.py dbshell

# Django shell
docker compose -f docker-compose.staging.yml exec backend python manage.py shell
```

### Stop Staging Server
```bash
docker compose -f docker-compose.staging.yml down
```

---

## 7. Transitioning to Production (With Domain & SSL)

When you are ready to point `brightmindzacademy.com` to the server:
1. Update DNS records (A Record: `@` and `www` -> `<YOUR_SERVER_IP>`).
2. Run Let's Encrypt Certbot:
   ```bash
   sudo apt-get install -y certbot
   sudo certbot certonly --standalone -d brightmindzacademy.com -d www.brightmindzacademy.com
   ```
3. Use the production compose file:
   ```bash
   docker compose -f docker-compose.yml --env-file .env up -d --build
   ```
