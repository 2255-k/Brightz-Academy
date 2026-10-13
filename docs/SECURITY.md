# Bright Mindz Academy — Application Security & Hardening Guide

This document describes the defensive controls, architectural boundaries, and operational procedures implemented to safeguard student data, payment transactions, and video curriculum at Bright Mindz Academy.

---

## 1. Authentication & Session Security

1. **Password Hashing:** Django's default PBKDF2 with SHA-256 (or Argon2) algorithm is used with work factors resisting offline brute-force attacks.
2. **Stateless JWT Tokens:** Authentication is governed by `rest_framework_simplejwt`. 
   - Access tokens have short lifespans (default: 120 minutes).
   - Refresh tokens (default: 14 days) are stored client-side and can be revoked.
   - User IDs are embedded in claims; passwords or sensitive PII are never encoded into tokens.
3. **Throttling & Abuse Prevention:**
   - Anonymous clients are rate-limited to `120 requests/minute`.
   - Sensitive auth endpoints (login, password reset) throttled to `15 attempts/minute`.
4. **Session Invalidation:** Explicit logout endpoints purge tokens on both the backend audit log and frontend `localStorage`.

---

## 2. Payment Security & Financial Integrity

1. **Zero Cardholder Data Storage:** The platform does not store card numbers, CVV codes, bank passwords, or UPI PINs. All interactive credit card and UPI handling takes place within the PCI-DSS certified Razorpay checkout interface.
2. **Server-Calculated Pricing:** The server **never** trusts a price or currency amount sent by the client browser. When `POST /api/payments/create-order/` is called, the price is looked up directly from the verified database record for the selected course (`course.effective_price`).
3. **Cryptographic Signature Verification:** 
   - Payments are verified on the server using HMAC-SHA256:
     ```
     HMAC_SHA256(order_id + "|" + payment_id, RAZORPAY_KEY_SECRET)
     ```
   - Enrollment access is **never** granted merely because the frontend reports success.
4. **Idempotent Webhook Processing:** Webhooks at `POST /api/payments/webhook/` verify the raw HTTP body bytes against `RAZORPAY_WEBHOOK_SECRET`. Repeated or duplicate webhooks are processed idempotently without duplicating enrollment or charging records.
5. **Database Transactions:** Course enrollment provisioning is wrapped in `transaction.atomic()`, preventing inconsistent database states if an error occurs.

---

## 3. Video Protection & Intellectual Property

1. **No Static Public URLs:** Pre-recorded lesson videos are never placed in the static web directory or served with permanent public links.
2. **Signed Token Playback:** Videos are delivered via Cloudflare Stream or Bunny Stream using short-lived signed tokens or signed iframe sessions (default validity: 3600 seconds).
3. **Server-Side Access Checks:** Every playback request (`POST /api/lessons/:id/playback/`) verifies:
   - Course publication status (`status='published'`).
   - Lesson preview flag (`is_preview=True`).
   - If not preview, active student enrollment (`Enrollment.objects.filter(student=user, course=course, status='active')`).
4. **Realistic Limitations:** Browser-based DRM and signed URLs prevent unauthorized downloading and link sharing. However, no web technology can prevent physical screen-recording software. The terms of service explicitly define recording as copyright infringement.

---

## 4. Network & Transport Hardening

1. **Strict Transport Security (HSTS):** Preloaded with `max-age=31536000` (1 year).
2. **CORS Isolation:** Cross-Origin Resource Sharing is strictly constrained to approved production origins (`https://www.brightmindzacademy.com`).
3. **X-Frame-Options:** Set to `SAMEORIGIN` to prevent clickjacking attacks.
4. **Content-Type Sniffing:** Disabled via `X-Content-Type-Options: nosniff`.
5. **Audit Logging:** Every financial creation, payment verification, failed signature attempt, and enrollment activation is logged in `apps.audit.models.AuditEvent`.
