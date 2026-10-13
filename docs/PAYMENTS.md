# Bright Mindz Academy — Payment Gateway Integration Guide

This guide documents the **Razorpay** payment gateway integration (and future Cashfree abstraction) for processing course enrollments in Indian Rupees (INR).

---

## 1. Credentials Configuration

Obtain your API keys from the [Razorpay Dashboard](https://dashboard.razorpay.com/) under **Settings → API Keys**.

Configure your `.env` file in `backend/`:
```ini
RAZORPAY_KEY_ID=rzp_test_YourKeyIDHere
RAZORPAY_KEY_SECRET=YourSecretKeyHere
RAZORPAY_WEBHOOK_SECRET=YourWebhookSecretHere
PAYMENT_CURRENCY=INR
```

> **Note:** During local development, if keys start with `rzp_test_placeholder` or are left default, the platform operates in **Sandbox Mock Mode**, allowing seamless UI and workflow testing without live bank gateways.

---

## 2. Payment Lifecycle Architecture

```
[Student]                 [Frontend]               [Django API]              [Razorpay]
   │                          │                         │                         │
   │ 1. Clicks "Enroll Now"   │                         │                         │
   ├─────────────────────────►│ 2. Create Order         │                         │
   │                          ├────────────────────────►│ 3. Fetch Course Price   │
   │                          │                         │    from trusted DB      │
   │                          │                         ├────────────────────────►│ 4. Create Order
   │                          │                         │◄────────────────────────┤    (amount in paise)
   │                          │◄────────────────────────┤ 5. Return Order ID      │
   │                          │    (rzp_order_id, key)  │                         │
   │                          │                         │                         │
   │ 6. Opens Razorpay Modal  │                         │                         │
   │◄─────────────────────────┤                         │                         │
   │                          │                         │                         │
   │ 7. Completes UPI/Card Pay│                         │                         │
   ├──────────────────────────┴─────────────────────────┴────────────────────────►│
   │                          │                         │                         │
   │ 8. Success Response      │                         │                         │
   │    (payment_id, signature)                         │                         │
   │◄─────────────────────────┴─────────────────────────┴─────────────────────────┤
   │                          │                         │                         │
   │                          │ 9. POST /api/payments/verify/                     │
   │                          ├────────────────────────►│ 10. HMAC-SHA256 Check   │
   │                          │                         ├─► Save Transaction      │
   │                          │                         └─► Activate Enrollment   │
   │                          │◄────────────────────────┤                         │
   │ 11. Dashboard Redirect   │                         │                         │
   │◄─────────────────────────┤                         │                         │
```

---

## 3. Webhook Configuration (Production)

To guard against network disconnects when a student completes payment on mobile but closes their browser before redirection, Razorpay webhooks asynchronously guarantee enrollment provisioning:

1. Log into **Razorpay Dashboard → Settings → Webhooks**.
2. Click **Add New Webhook**.
3. **Webhook URL:** `https://www.brightmindzacademy.com/api/payments/webhook/`
4. **Secret:** Set to match `RAZORPAY_WEBHOOK_SECRET` in your `.env`.
5. **Active Events:**
   - `order.paid`
   - `payment.captured`
   - `payment.failed`
6. Save the webhook.

---

## 4. Administrative Reconciliation

If a student encounters a banking dispute or payment delay:
1. Open the Django Admin at `https://www.brightmindzacademy.com/admin/`.
2. Navigate to **Payments → Orders**.
3. Search by student email, order reference, or Razorpay payment ID (`pay_...`).
4. Administrators can review raw gateway responses in the `PaymentTransaction` inlines.
5. If payment is confirmed in the Razorpay banking dashboard, the administrator can activate enrollment with one click in **Enrollments → Add Course Enrollment**.
