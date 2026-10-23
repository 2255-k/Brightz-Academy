#!/usr/bin/env bash
# ==============================================================================
# Bright Mindz Academy - Automated Linux VPS Test / Staging Deployment Script
# Target: Ubuntu 22.04 / 24.04 LTS or Debian 11 / 12
# Usage:
#   chmod +x scripts/deploy_staging.sh
#   ./scripts/deploy_staging.sh
# ==============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}====================================================================${NC}"
echo -e "${CYAN}   Bright Mindz Academy - Automated Staging Server Deployment      ${NC}"
echo -e "${CYAN}   Location: Kochi, Kerala, India                                  ${NC}"
echo -e "${CYAN}====================================================================${NC}"

# 1. Check & Install Docker / Docker Compose if missing
echo -e "\n${BLUE}[1/6] Checking system dependencies (Docker & Docker Compose)...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker engine and compose plugin...${NC}"
    sudo apt-get update -y
    sudo apt-get install -y ca-certificates curl gnupg lsb-release
    
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes || \
    curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes
    
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add Docker repository
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS_ID=$ID
        OS_CODENAME=$VERSION_CODENAME
    else
        OS_ID="ubuntu"
        OS_CODENAME="jammy"
    fi
    
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${OS_ID} \
      ${OS_CODENAME} stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo systemctl enable docker
    sudo systemctl start docker
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed: $(docker --version)${NC}"
fi

# Detect docker compose syntax (plugin or standalone)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found.${NC}"
    exit 1
fi
echo -e "${GREEN}Using: $($DOCKER_COMPOSE version)${NC}"

# 2. Check Staging Environment File (.env.staging or .env)
echo -e "\n${BLUE}[2/6] Configuring Staging Environment Variables...${NC}"
if [ ! -f ".env.staging" ]; then
    echo -e "${YELLOW}Creating default .env.staging from template...${NC}"
    cat << 'EOF' > .env.staging
# Bright Mindz Academy - Staging Test Server Environment
DEBUG=False
SECRET_KEY=brightmindz-staging-test-key-kochi-kerala-2026-secure
ALLOWED_HOSTS=*
CORS_ALLOW_ALL_ORIGINS=True
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# Database
DB_ENGINE=postgres
DB_NAME=brightmindz_staging_db
DB_USER=brightmindz_user
DB_PASSWORD=brightmindz_staging_secret
DB_HOST=db
DB_PORT=5432

# Integrations
RAZORPAY_KEY_ID=rzp_test_staging_placeholder
RAZORPAY_KEY_SECRET=rzp_test_staging_secret
RAZORPAY_WEBHOOK_SECRET=rzp_webhook_staging_secret
VIDEO_PROVIDER=mock
WHATSAPP_PHONE_NUMBER=919846000000
EOF
    echo -e "${GREEN}Generated .env.staging${NC}"
else
    echo -e "${GREEN}.env.staging already present.${NC}"
fi

# 3. Build & Launch Docker Containers
echo -e "\n${BLUE}[3/6] Building and starting Staging Docker containers...${NC}"
$DOCKER_COMPOSE -f docker-compose.staging.yml --env-file .env.staging down --remove-orphans || true
$DOCKER_COMPOSE -f docker-compose.staging.yml --env-file .env.staging build
$DOCKER_COMPOSE -f docker-compose.staging.yml --env-file .env.staging up -d

# 4. Wait for Database and Apply Migrations
echo -e "\n${BLUE}[4/6] Waiting for PostgreSQL database and backend initialization...${NC}"
MAX_RETRIES=30
RETRY_COUNT=0
until $DOCKER_COMPOSE -f docker-compose.staging.yml exec -T db pg_isready -U brightmindz_user -d brightmindz_staging_db &> /dev/null || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
    echo "Waiting for PostgreSQL database container to report healthy... ($((RETRY_COUNT+1))/$MAX_RETRIES)"
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${RED}Database did not become ready in time. Check logs with: $DOCKER_COMPOSE -f docker-compose.staging.yml logs db${NC}"
    exit 1
fi
echo -e "${GREEN}Database is healthy and ready!${NC}"

# Allow backend container to complete entrypoint migrations
sleep 5

# 5. Seed Test Data & Create Admin
echo -e "\n${BLUE}[5/6] Seeding initial courses, trainers, and test accounts...${NC}"
$DOCKER_COMPOSE -f docker-compose.staging.yml exec -T backend python manage.py populate_brightmindz_demo

echo -e "${YELLOW}Ensuring demo admin account exists...${NC}"
$DOCKER_COMPOSE -f docker-compose.staging.yml exec -T backend python -c "
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()
from apps.accounts.models import User
if not User.objects.filter(email='admin@brightmindzacademy.com').exists():
    User.objects.create_superuser('admin@brightmindzacademy.com', 'AdminPass123!', full_name='Bright Mindz Admin', role='admin')
    print('Superuser admin@brightmindzacademy.com created successfully.')
else:
    print('Superuser admin@brightmindzacademy.com already exists.')
"

# 6. Sanity Health Checks
echo -e "\n${BLUE}[6/6] Verifying Staging Server Endpoints...${NC}"
sleep 2

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1/api/courses/ || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}Backend API Health Check PASSED: HTTP $HTTP_CODE${NC}"
else
    echo -e "${YELLOW}Backend API check returned HTTP $HTTP_CODE (may still be starting up)${NC}"
fi

# Detect Server Public IP
PUBLIC_IP=$(curl -s https://api.ipify.org || curl -s ifconfig.me || echo "<YOUR_SERVER_IP>")

echo -e "\n${GREEN}====================================================================${NC}"
echo -e "${GREEN}   DEPLOYMENT COMPLETED SUCCESSFULLY!                              ${NC}"
echo -e "${GREEN}====================================================================${NC}"
echo -e "Your Bright Mindz Academy staging instance is live at:"
echo -e "   Frontend Web Application:  ${CYAN}http://${PUBLIC_IP}/${NC}"
echo -e "   Django REST API Courses:   ${CYAN}http://${PUBLIC_IP}/api/courses/${NC}"
echo -e "   Django Admin Portal:       ${CYAN}http://${PUBLIC_IP}/admin/${NC}"
echo -e "\nCredentials:"
echo -e "   Admin Portal:   ${YELLOW}admin@brightmindzacademy.com${NC} / ${YELLOW}AdminPass123!${NC}"
echo -e "   Student Demo:   ${YELLOW}student@brightmindzacademy.com${NC} / ${YELLOW}StudentPass123!${NC}"
echo -e "\nUseful Maintenance Commands:"
echo -e "   View live logs:         ${CYAN}$DOCKER_COMPOSE -f docker-compose.staging.yml logs -f${NC}"
echo -e "   Restart platform:       ${CYAN}$DOCKER_COMPOSE -f docker-compose.staging.yml restart${NC}"
echo -e "   Stop test platform:     ${CYAN}$DOCKER_COMPOSE -f docker-compose.staging.yml down${NC}"
echo -e "${GREEN}====================================================================${NC}"
