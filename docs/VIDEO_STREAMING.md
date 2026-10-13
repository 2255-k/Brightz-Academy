# Bright Mindz Academy — Protected Video Delivery Architecture

This document describes the video protection and streaming architecture for Bright Mindz Academy's pre-recorded Spoken English courses.

---

## 1. Architecture Overview

To protect the academy's proprietary intellectual property, video files are never hosted as static MP4 files on the web server. Instead, video delivery is decoupled using an **adapter pattern**:

```
                       [ Student Client ]
                               │
            1. Requests stream │ 2. Validates Enrollment
                               ▼
                    [ Django Backend API ]
                               │
             3. Generates signed, short-lived token
                               ▼
        ┌──────────────────────┴──────────────────────┐
        │                                             │
 [ Cloudflare Stream ]                         [ Bunny Stream ]
  - RS256 JWT playback tokens                   - SHA-256 token authentication
  - Allowed embedding domains                   - Token expiry timestamps
  - HLS / DASH adaptive streaming               - Multi-CDN edge delivery
```

---

## 2. Supported Streaming Providers

### 2.1 Cloudflare Stream (Recommended)
Cloudflare Stream encodes videos into adaptive bitrate HLS/DASH streams with signed JSON Web Tokens (JWT).

**Configuration (`backend/.env`):**
```ini
VIDEO_PROVIDER=cloudflare
CLOUDFLARE_STREAM_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_STREAM_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=your_customer_subdomain
CLOUDFLARE_STREAM_PEM_KEY_ID=your_key_id
CLOUDFLARE_STREAM_JWK_KEY=your_private_jwk_key
```

### 2.2 Bunny Stream
Bunny Stream provides cost-effective global video delivery with SHA-256 token security.

**Configuration (`backend/.env`):**
```ini
VIDEO_PROVIDER=bunny
BUNNY_STREAM_LIBRARY_ID=your_library_id
BUNNY_STREAM_API_KEY=your_api_key
BUNNY_STREAM_TOKEN_AUTH_KEY=your_token_authentication_key
```

### 2.3 Development Mock Mode
When developing locally or running automated tests without live CDN subscriptions:
```ini
VIDEO_PROVIDER=mock
```
In mock mode, the server generates valid cryptographic HMAC session tokens and points to a sample stream while enforcing 100% authentic enrollment access permissions.

---

## 3. Lesson Playback Lifecycle

1. **Student requests lesson video:**
   `POST /api/lessons/{id}/playback/`
2. **Access Control Checks:**
   - Lesson `is_preview == True`? Access granted to all visitors.
   - If not preview: verifies caller is logged in AND has an active, unexpired record in `Enrollment`.
   - If unenrolled, returns `HTTP 403 Forbidden` with course purchase link.
3. **Signed Token Generation:**
   - Generates token with a 60-minute expiration window.
   - Retrieves student's last recorded bookmark timestamp (`last_position_seconds`).
4. **Player Initialization:**
   - Frontend loads the stream and restores playback position automatically.
   - On pause or progress interval, `POST /api/student/lessons/{id}/progress/` bookmarks position.
   - When 90% of duration is reached, lesson is automatically marked as completed.
