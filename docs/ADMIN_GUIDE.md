# Bright Mindz Academy — Administrator & Operations Guide

**Admin Portal URL:** `https://www.brightmindzacademy.com/admin/`  
**Purpose:** Daily operational management of courses, curriculum, video IDs, student enrollments, payment reconciliation, and admissions inquiries.

---

## 1. Accessing the Admin Interface

1. Open your browser and navigate to `/admin/`.
2. Log in using your designated administrator email and password.
3. The administration dashboard provides search, filtering, and bulk management across all academy applications.

---

## 2. Managing Courses & Curriculum

### 2.1 Adding a New Course
1. Navigate to **Courses → Courses → Add Course**.
2. Specify the **Title**, **Subtitle**, and select the **Teaching Language** (e.g., Malayalam, Tamil, Hindi).
3. Set the **Proficiency Level** (Foundation, Beginner, Intermediate, Advanced).
4. Set the **Price (INR)** and optional **Discount Price (INR)**.
5. Set the **Access Duration in Days** (default: `365` for 1-year access, or `0` for lifetime access).
6. Upload a high-resolution 16:9 course thumbnail or paste an image URL.
7. Change **Publication Status** from `Draft` to `Published` when ready for public catalog discovery.

### 2.2 Adding Modules and Video Lessons
1. Scroll down to the **Course Modules** inline or click into **Course Modules**.
2. Add a chapter/module (e.g. *Module 1: Everyday Conversational Sentences*).
3. Inside the module, click **Add Lesson**:
   - **Lesson Title:** e.g., *Introducing Yourself at Work*.
   - **Video Provider:** Select `Cloudflare Stream` or `Bunny Stream`.
   - **Provider Video Identifier:** Paste the video ID from your streaming provider dashboard.
   - **Duration in Seconds:** e.g., `900` for 15 minutes.
   - **Free Preview:** Check this box if this lesson should be free for public sampling on the website!
   - **Publication Status:** Set to `Published`.

---

## 3. Managing Teaching Languages

Bright Mindz Academy is designed for multiple Indian languages:
1. Navigate to **Courses → Teaching Languages**.
2. Click **Add Teaching Language**.
3. Enter English Name (e.g., *Telugu*), Native Name (*తెలుగు*), and ISO code (*te*).
4. Save to immediately make this language selectable across filters and the admissions portal.

---

## 4. Student Admissions & Lead Enquiries

1. Navigate to **Enquiries → Contact Enquiries**.
2. View new inquiries submitted via the website contact form.
3. Each record contains the student's name, phone/WhatsApp number, preferred mother tongue, and inquiry message.
4. Update the **Status** field as your counseling team progresses:
   - `New`: Newly received inquiry.
   - `Contacted`: Counselor has phoned or messaged the student on WhatsApp.
   - `Resolved`: Student has enrolled or inquiry concluded.

---

## 5. Reviewing Orders & Manual Enrollment Grants

### 5.1 Payment Reconciliation
1. Navigate to **Payments → Orders**.
2. Search by student email, order reference, or Razorpay payment ID.
3. Click an order to review transaction history and raw webhook audit records.

### 5.2 Granting Complimentary or Offline Enrollment
If a student pays offline via bank transfer or cash:
1. Navigate to **Enrollments → Course Enrollments → Add Course Enrollment**.
2. Select the **Student** and the **Course**.
3. Set **Status** to `Active Access`.
4. Enter optional administrative notes (e.g., *Offline admission ref #1234*).
5. Click **Save**. The student will immediately see the course on their dashboard.

---

## 6. Managing Testimonials & FAQs

- **Testimonials:** In **Content → Student Testimonials**, review student feedback. Ensure the **Student Publication Consent Verified** checkbox is ticked before setting **Is Published** to True.
- **FAQs:** In **Content → FAQs**, add or update answers. Categorize questions under *General*, *Courses*, *Payments*, or *Technical* to automatically position them in the student FAQ directory.
