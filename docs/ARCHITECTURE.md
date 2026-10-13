# Bright Mindz Academy — Architecture & Technical Blueprint

**Target Domain:** https://www.brightmindzacademy.com  
**Headquarters:** Kochi, Kerala, India  
**Specialization:** Pre-recorded, self-paced Spoken English courses explained in Indian mother tongues (Malayalam, Tamil, Hindi, and extensible Indian languages).

---

## 1. System Architecture Diagram

```
                             [ Client Devices: Mobile / Tablet / Desktop ]
                                                   │
                                      HTTPS (Port 443) / Let's Encrypt
                                                   │
                                            [ Nginx Proxy ]
                            ┌──────────────────────┴──────────────────────┐
                            │ (SPA Frontend routes)                       │ (API / Admin routes)
                    [ React 18 + Vite ]                          [ Gunicorn WSGI ]
                 Tailwind CSS / Lucide / Router                 Django 5.1 + REST Framework
                            │                                             │
                            │                                   ┌─────────┴─────────┐
                            │                                   │                   │
                            │ (JSON REST Requests)              ▼                   ▼
                            └──────────────────────────► [ PostgreSQL 16 ]  [ External Services ]
                                                          - Accounts DB      - Razorpay Gateway
                                                          - Courses DB       - Cloudflare / Bunny Stream
                                                          - Enrollments DB   - WhatsApp API
                                                          - Audit Events DB  - SMTP Mailer
```

---

## 2. Component Breakdown

### 2.1 Frontend Single Page Application (SPA)
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 with custom tokens for an educational palette (Deep Blue `#0f2b48`, Teal `#0d9488`, Warm Gold `#f59e0b`).
- **Icons:** `lucide-react`
- **Routing:** `react-router-dom` v7 with pushState routing, PublicLayout, and StudentLayout.
- **State & Auth:** `AuthContext` with JWT tokens persisted in localStorage, automatic refresh interceptor via Axios.
- **Player:** Modular streaming player supporting Cloudflare Stream iframes and native HTML5 video with token validation.

### 2.2 Backend API (Django & DRF)
- **Language/Framework:** Python 3.13, Django 5.1, Django REST Framework 3.18
- **Authentication:** `rest_framework_simplejwt` with HMAC-SHA256 tokens.
- **Modularity:** 8 decoupled domain applications:
  1. `apps.accounts`: Custom user model, JWT login, registration, and learner profiles.
  2. `apps.courses`: Languages, proficiency levels, courses, modules, and lessons.
  3. `apps.enrollments`: Active course access records, per-lesson video watch bookmarks, and completion tracking.
  4. `apps.payments`: Orders, Razorpay gateway adapter, HMAC signature verification, and idempotent webhook handlers.
  5. `apps.video`: Cloudflare Stream and Bunny Stream adapters with short-lived signed playback tokens and dev mock fallback.
  6. `apps.content`: Certified trainers, student testimonials with consent tags, and categorized FAQs.
  7. `apps.enquiries`: Admissions contact form with honeypot spam protection and counselor status workflow.
  8. `apps.audit`: Immutable security audit events.

---

## 3. Data Flow & Security Boundaries

```
[ Visitor / Student ]             [ React Client ]             [ Django API ]             [ Razorpay / CDN ]
         │                              │                            │                            │
         │ 1. Browse Courses            │                            │                            │
         ├─────────────────────────────►│ GET /api/courses/          │                            │
         │                              ├───────────────────────────►│                            │
         │                              │◄───────────────────────────┤ (Only Public Metadata)     │
         │                              │                            │                            │
         │ 2. Initiates Checkout        │                            │                            │
         ├─────────────────────────────►│ POST /api/payments/order   │                            │
         │                              ├───────────────────────────►│ (Price calculated in DB)   │
         │                              │                            ├───────────────────────────►│ Create Order
         │                              │                            │◄───────────────────────────┤ Return Order ID
         │                              │◄───────────────────────────┤                            │
         │ 3. Completes UPI/Card Pay    │                            │                            │
         ├──────────────────────────────┴────────────────────────────┴───────────────────────────►│ Gateway Pay
         │ 4. Signature Submitted       │ POST /api/payments/verify/ │                            │
         ├─────────────────────────────►│───────────────────────────►│ (HMAC-SHA256 check)        │
         │                              │                            ├─► Transaction Saved        │
         │                              │                            └─► Enrollment Granted       │
         │                              │◄───────────────────────────┤ (HTTP 200 OK)              │
         │                              │                            │                            │
         │ 5. Plays Lesson Video        │                            │                            │
         ├─────────────────────────────►│ POST /api/lessons/:id/play │                            │
         │                              ├───────────────────────────►│ (Check Enrollment DB)      │
         │                              │                            ├─► If valid: Generate Token │
         │                              │◄───────────────────────────┤ (Signed Playback URL)      │
         │ 6. Streams Video Player      │                            │                            │
         │◄─────────────────────────────┴────────────────────────────┴────────────────────────────┤
```
