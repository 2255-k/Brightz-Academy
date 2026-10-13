# Bright Mindz Academy — Production Deployment & DevOps Guide

**Domain:** https://www.brightmindzacademy.com  
**Target Environment:** Linux VPS / Cloud Server (Ubuntu 22.04 LTS or Debian 12)  
**Coordination Note:** The domain registrar, hosting account, and server credentials are managed by **Rohit**. Follow the coordination checklist below when preparing production launch.

---

## 1. Domain & DNS Coordination Checklist (for Rohit)

Coordinate with Rohit to configure DNS records at the domain registrar:

| Record Type | Name / Host | Target / Value | TTL |
| :--- | :--- | :--- | :--- |
| **A Record** | `@` (brightmindzacademy.com) | `[Your Server Public IPv4]` | 300 / Auto |
| **CNAME** | `www` (www.brightmindzacademy.com) | `brightmindzacademy.com` | 300 / Auto |

---

## 2. Server Prerequisites

On the production server, ensure Docker and Docker Compose are installed:
```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose
sudo apt install -y curl git ufw
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Configure Firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

---

## 3. Deployment Steps

### 3.1 Clone Repository & Configure Secrets
```bash
cd /opt
git clone https://github.com/your-org/brightmindz-academy.git
cd brightmindz-academy

# Copy production environment template
cp .env.example .env
nano .env
```
Ensure the following are set in `.env`:
- `DEBUG=False`
- `SECRET_KEY=A_STRONG_RANDOM_50_CHAR_STRING`
- `ALLOWED_HOSTS=brightmindzacademy.com,www.brightmindzacademy.com,localhost`
- `CORS_ALLOWED_ORIGINS=https://www.brightmindzacademy.com`
- `DB_PASSWORD=A_STRONG_DB_PASSWORD`
- `RAZORPAY_KEY_ID=rzp_live_...`
- `RAZORPAY_KEY_SECRET=...`
- `RAZORPAY_WEBHOOK_SECRET=...`

### 3.2 SSL Certificate Issuance (Let's Encrypt)
```bash
# Obtain initial certificate using standalone Certbot
sudo apt install -y certbot
sudo certbot certonly --standalone -d brightmindzacademy.com -d www.brightmindzacademy.com
```

### 3.3 Launch Services via Docker Compose
```bash
docker compose up -d --build
```

### 3.4 Create Superuser / Administrator
```bash
# Execute within the running backend container
docker compose exec backend python manage.py createsuperuser
```
Follow the prompt to set the administrator's email and secure password.

### 3.5 Populate Demo / Initial Seed Data (Optional)
```bash
docker compose exec backend python manage.py populate_brightmindz_demo
```

---

## 4. Automated Backup Schedule (Cron)

Schedule nightly database snapshots using `crontab -e`:
```bash
# Run backup every night at 2:00 AM IST
0 2 * * * cd /opt/brightmindz-academy && docker compose exec -T backend python /app/scripts/backup_db.py >> /var/log/bma_backup.log 2>&1
```

---

## 5. Updates & Zero-Downtime Rollouts

When deploying updates:
```bash
git pull origin main
docker compose build
docker compose up -d --no-deps backend frontend
docker compose exec backend python manage.py migrate
```
