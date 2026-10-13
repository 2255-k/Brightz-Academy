# Bright Mindz Academy — Learning Management System & Public Web Platform

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://python.org)
[![Django](https://img.shields.io/badge/Django-5.1-green.svg)](https://djangoproject.com)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)](https://typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)]()

> **"Learn Spoken English in Your Mother Tongue"**  
> Official web platform and secure Learning Management System (LMS) for **Bright Mindz Academy**, Kochi, Kerala, India.  
> Official Domain: [https://www.brightmindzacademy.com](https://www.brightmindzacademy.com)

---

## 1. Executive Summary & Vision

Bright Mindz Academy empowers learners of all ages, backgrounds, and starting proficiency levels across India to master fluent English communication through structured, self-paced, pre-recorded video lessons delivered with explanations in their own mother tongue (initially **Malayalam**, **Tamil**, and **Hindi**).

### Core Features
- **Public Portal:** Modern, welcoming website showcasing mother-tongue course discovery, syllabus previews, trainer credentials, genuine FAQs, student testimonials, and WhatsApp click-to-chat.
- **Student LMS Dashboard:** Enrolled courses, resume learning, dynamic progress tracking calculated from verified lesson completion records, and order history.
- **Secure Video Streaming:** Server-authorized playback token generation (Cloudflare Stream / Bunny Stream adapter with dev mock mode), strictly preventing unauthorized access to paid curriculum.
- **Indian Payment Integration:** Seamless Razorpay integration (INR checkout, HMAC-SHA256 signature verification, raw-body idempotent webhook processing, duplicate protection, Cashfree-ready abstraction).
- **Administration Suite:** Secure Django admin portal for managing courses, modules, lessons, trainers, enquiries, student enrollments, and payment reconciliation.
- **Strict Role-Based Security:** Backend-enforced permissions, OWASP hardening, strict CORS/CSRF configurations, and safe environment secret handling.

---

## 2. System Architecture

```
brightmindz-academy/
├── backend/                  # Django REST Framework Backend
│   ├── config/               # Settings, routing, WSGI, ASGI
│   ├── apps/
│   │   ├── accounts/         # Custom user model, JWT auth, profiles
│   │   ├── courses/          # Courses, modules, lessons, languages
│   │   ├── enrollments/      # Enrollments, lesson progress tracking
│   │   ├── payments/         # Orders, Razorpay/Cashfree gateway, webhooks
│   │   ├── video/            # Cloudflare Stream & Bunny signed token adapters
│   │   ├── content/          # Trainers, testimonials, FAQs
│   │   ├── enquiries/        # Contact forms, lead capture, spam filtering
│   │   └── audit/            # Audit events & security logs
│   ├── manage.py
│   └── requirements.txt
├── frontend/                 # React + TypeScript + Vite SPA
│   ├── src/
│   │   ├── components/       # UI design system (Navbar, Footer, Modal, etc.)
│   │   ├── layouts/          # PublicLayout, StudentLayout
│   │   ├── pages/            # Home, Courses, CourseDetails, About, Trainers, Contact, FAQ, Legal
│   │   ├── features/
│   │   │   ├── auth/         # Login, Register, AuthContext
│   │   │   ├── courses/      # Filterable catalog, syllabus accordion
│   │   │   ├── checkout/     # Razorpay payment modal & verification
│   │   │   └── dashboard/    # Student dashboard & secure video player
│   │   ├── services/         # Axios API client & endpoints
│   │   ├── types/            # TypeScript schemas & contracts
│   │   └── utils/            # Currency, date, formatting helpers
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docker/                   # Dockerfile & Nginx production reverse proxy config
├── docker-compose.yml        # Multi-container orchestration (App + Postgres + Nginx)
├── docs/                     # Comprehensive architectural & operational guides
│   ├── ARCHITECTURE.md
│   ├── SECURITY.md
│   ├── PAYMENTS.md
│   ├── VIDEO_STREAMING.md
│   ├── DEPLOYMENT.md
│   └── ADMIN_GUIDE.md
├── scripts/                  # Data seeders & backup utilities
├── .env.example              # Master configuration template
└── README.md
```

---

## 3. Quickstart & Local Setup

### Prerequisites
- **Python:** 3.10+ (Recommended: 3.12 or 3.13)
- **Node.js:** 18+ or 20+ (LTS) & npm 10+
- **Database:** PostgreSQL (production) or built-in SQLite (local development)

### 3.1 Backend Setup
```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
copy ..\.env.example .env

# Apply migrations
python manage.py migrate

# Seed initial demonstration courses (Malayalam, Tamil, Hindi)
python manage.py populate_brightmindz_demo

# Start Django development server
python manage.py runserver 0.0.0.0:8000
```
Backend API will be running at `http://localhost:8000/api/` and Admin at `http://localhost:8000/admin/`.

### 3.2 Frontend Setup
```bash
# Navigate to frontend in a new terminal
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend application will be accessible at `http://localhost:5173/`.

---

## 4. Payment Gateway Configuration (Razorpay)

1. Obtain test API keys from [Razorpay Dashboard](https://dashboard.razorpay.com).
2. Configure `.env` in `backend/`:
   ```ini
   RAZORPAY_KEY_ID=rzp_test_YourKeyIDHere
   RAZORPAY_KEY_SECRET=YourSecretKeyHere
   RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
   ```
3. In local development without public webhooks, the checkout verification endpoint `/api/payments/verify/` validates the payment signature directly using HMAC-SHA256.

---

## 5. Protected Video Streaming

Bright Mindz Academy does not expose direct static video files.
- **Provider Adapters:** Located in `backend/apps/video/adapters/`.
- **Development Mock Mode:** When `VIDEO_PROVIDER=mock`, the system serves controlled development stream endpoints with signed, expiring session tokens to enable complete local UI/UX testing.
- **Production Mode:** Set `VIDEO_PROVIDER=cloudflare` or `VIDEO_PROVIDER=bunny` and configure the corresponding credentials in `.env`.

---

## 6. Hosting & DNS Coordination Note

The domain **www.brightmindzacademy.com** and DNS records are managed by **Rohit**.
Refer to [`docs/DEPLOYMENT.md`](file:///c:/Users/User/Desktop/BRIGHTz/docs/DEPLOYMENT.md) for DNS A/CNAME record requirements, SSL certificate issuance via Let's Encrypt / Cloudflare, and Nginx reverse proxy configuration.
