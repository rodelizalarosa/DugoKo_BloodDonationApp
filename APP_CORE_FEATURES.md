# DugóKo — Core Features, End-to-End Flows, and Project Rules/Specifications

This document lists the **core features** of the DugóKo app and provides the **detailed flow** for each process, plus the **rules/specifications** that govern eligibility gating, “I Can Help”, posting, and donation verification.

> Source of truth for specs/flows in this repo:
> - `APP_CORE_FEATURES.md` (this file)
> - `database/schema.sql` (canonical data model + enums/statuses)
> - `TODO.md` (implementation gaps / checklist)

---

## 1) Navigation & Screen Grouping (How the app is organized)

### 1.1 Route groups (expo-router)
Routes are defined via `app/` and `app/_layout.tsx` (stack + tabs). Core modules:

- Auth:
  - `app/auth/login.tsx`
  - `app/auth/register.tsx`
  - `app/auth/forgot-password.tsx`
  - `app/auth/otp.tsx`
  - `app/auth/reset-password.tsx`

- Tabs:
  - `app/(tabs)/index.tsx` (Home)
  - `app/(tabs)/donate.tsx` (Donate hub)
  - `app/(tabs)/community.tsx` (Community feed)
  - `app/(tabs)/learn.tsx` (Learn list)
  - `app/(tabs)/profile.tsx` (Profile hub)

- Donate detail screens:
  - `app/donate/eligibility.tsx`
  - `app/donate/centers.tsx`
  - `app/donate/events/index.tsx`
  - `app/donate/events/[id].tsx`
  - `app/donate/log.tsx`
  - `app/donate/receipt.tsx`

- Community:
  - `app/community/category/[type].tsx`
  - `app/community/[id].tsx` (request/story/announcement detail)

- Learn:
  - `app/learn/[id].tsx`

- Profile:
  - `app/profile/edit.tsx`
  - `app/profile/history.tsx`
  - `app/profile/settings.tsx`

---

## 2) Core Modules Overview

- **Authentication (Onboarding/Auth module)**
- **Home**
- **Donate**
- **Community**
- **Learn**
- **Profile**

---

## 3) Authentication Module (Onboarding Screen)

### 3.1 Login
**Route:** `/auth/login`

1. User inputs credentials:
   - Email
   - Password
2. App checks if credentials match.
3. If user is new:
   - redirect to **Complete Profile** (then proceed to Home)
4. If not new:
   - proceed to **Home Screen**

### 3.2 Forgot Password
**Route:** `/auth/forgot-password` → `/auth/otp` → `/auth/reset-password`

1. User enters email.
2. App sends OTP to the email.
   - OTP is **effective for 15 minutes**.
   - If OTP is not sent/available, allow **resend**.
3. User inputs the **6-digit code**.
4. Verify OTP.
5. User sets a new password.
6. Password reset complete → redirect back to **Login**.

### 3.3 Register
**Route:** `/auth/register`

1. User inputs registration credentials:
   - First name
   - Middle initial
   - Last name
   - Email (must be unique)
   - Contact number
   - Password
   - Confirm password
2. App checks email uniqueness.
3. OTP is sent to the email.
4. User inputs **6-digit OTP** to register.
5. Verify OTP.
6. Registration completes successfully.
7. Redirect back to **Login**.

---

## 4) Home Module

### 4.1 Greetings
- Display greeting based on profile state.

### 4.2 Eligibility Card → Eligibility Checker (Donate module)
- Provide an entry point to Donate eligibility.
- **Find Event / eligibility CTA** should guide the user into the Donate flow.

### 4.3 Upcoming Event
- Include **View Event** button.
- Must show the **latest Blood Letting Event**.
- Tapping an event opens event details and RSVP/participation flow.

### 4.4 AI FEATURE NI SHA — Smart Blood Request Matching
**Purpose:** Smart Analytics / Smart Blood Request Matching.

AI analyzes:
- user data
- blood type compatibility
- last donation date
- eligibility
- distance from request

AI ranks donors and presents **Recommended Donors** cards, e.g.:
1. Juan Cruz — A+ — Eligible — 3 km away
2. Maria Santos — O+ — Eligible — 5 km away

#### Push notification content (example)
“Someone nearby urgently needs A+ blood. You are eligible and compatible. Would you like to help?”

#### UI rule: change “View Eligibility”
- Replace **View Eligibility** with **I Can Help**.

#### I Can Help → Eligibility Checker → I Can Help form
1. User taps **I Can Help** from the recommendation card / prompt.
2. Open **Eligibility Checker**.
3. If eligible:
   - show **I Can Help form** requesting:
     - full name
     - contact number
     - email
4. User checks the checkbox and keeps the important note:
   - **Confirmation email will be sent to the donor**.
   - **On requester side**, only **full name and contact number** will appear.
5. Validate credentials format.
6. Submit.

### 4.5 Ask Dona AI
- User asks about blood donation.
- AI responds using **Philippine Red Cross guidelines**.
- Include disclaimer:
  - “Not a medical diagnosis” (and that it’s informational guidance only).

---

## 5) Donate Module

### 5.1 Eligibility Checker (questionnaire)
**Route:** `/donate/eligibility`

1. User answers a questionnaire (5 yes/no).
2. App computes result:
   - **eligible**
   - **deferred**
   - **not eligible**
   - other fallback states as needed

#### Disclaimer (MUST)
- “Results will not replace the assessment of the PRC regarding blood donation.”
- This helps donors understand factors that affect eligibility to donate immediately.

3. If eligible:
   - proceed to donation actions.
4. If deferred:
   - result shows **temporarily deferred**
   - **Learn why** button routes to Learn explanations.

### 5.2 Find Donation Center
**Route:** `/donate/centers`

1. User can select location.
2. Show **Get directions** (Mapbox navigation).
3. Show **Call Center** (directly call station).

### 5.3 Blood Letting Events
**Routes:**
- `/donate/events/index.tsx`
- `/donate/events/[id].tsx`

1. Select blood letting events near you.
2. Each event shows Complete Details.
3. Provide **Get directions** (Mapbox).
4. If user wants to donate and get a slot:
   - click **I’m going**
   - open event registration form:
     - full name
     - contact number
     - email
   - submit registration
5. Email confirmation is sent:
   - includes ticket reference
   - includes notes on what to bring
6. Slot confirmed.

#### After registration: log donation from the same event
- After registering, user can return to the same event and click **Log donation**.
- Required details auto-populate.
- Optional: fill out **Red Cross Verification Card** (optional but encouraged)
  - upload donor card given by PRC or any document that verifies participation
  - subject for review

#### Save Donation and receipt behavior
- “Saving will update your total donations.”
- **Verified cards**:
  - generate certified digital records immediately
  - receipt buttons **enabled** for print/download
- **Unverified cards**:
  - remain **subject for review** (not “remain pending”)
  - receipt buttons **disabled** for print/download

### 5.4 Log a Donation (self-logged)
- If already donated but not registered to any events beforehand, it’s okay.

Flow:
1. Fill required details.
2. Provide **Red Cross Verification Card** (optional but encouraged).
3. Save donation.
4. Receipt display note:
   - “Self-logged. Red Cross is verifying card photo (takes 3–5 days).”
5. Receipt buttons:
   - if unverified: print/download **disabled**
   - if verified: print/download **enabled**

### 5.5 Donation Receipt
**Route:** `/donate/receipt`

- Shows **ALL donation receipts** for the user (verified and unverified).
- If verified by PRC: print/download buttons enabled.
- If not verified: print/download buttons disabled.
- Sharing should remain available for unverified receipts.

---

## 6) Community Module

### 6.1 Community feed + quick actions
- Provide 3 quick actions:
  - Blood Request
  - Donor Story
  - Announcement

**Posting rule change (MUST):**
- Remove eligibility gating for creating **Blood Request** and **Donor Story** posts.
- Anyone can request blood.

- Remove Blood request and donor story buttons for posting from places where they were gated; place their creation inside their respective concerns (request/story create entry points).

### 6.2 Feed ordering + filtering
- Recent activities arranged from latest to old.
- Filtering feature: **All time / Today / This week / This month**.
- Up to 10 posts shown for recent activities.

---

## 7) Community — Blood Request

### 7.1 Viewing all blood requests
**Route:** community screens (feed)
- Show all blood request posts.

### 7.2 Posting a Blood Request
At the top, users can post/request blood using a section like “What’s on your mind”.

User completes:

**Required fields:**
- Hospital name + location
- Blood type
- Units of blood
- When blood is needed
  - accepts values like “today”, specific date/time, etc.

**Optional fields:**
- additional patient info
- additional notes (e.g., willingness to pay)

**System triage classification (MUST):**
- System determines urgency/critical/pledge based on:
  - when blood is needed
  - reason why blood is needed
- Examples:
  - **critical** if for surgeries
  - **urgent** if needed today/as soon as possible
  - **pledge** if needed for dialysis / not really urgent but needed this week

Submit button:
- creates the blood request post.

### 7.3 Responding to a blood request
1. Open a specific post card.
2. System checks if your blood type can donate.
3. If yes:
   - show **I Can Help** button
4. If no:
   - hide I Can Help button
5. Tap **I Can Help** → open **Eligibility Checker**.
6. If eligible:
   - show **I Can Help form** (full name, contact number, email)
   - checkbox + important note:
     - confirmation email sent to donor
     - requester side shows only full name and contact number
   - credentials format check
   - submit

---

## 8) Community — Donor Stories

### 8.1 Viewing all donor stories
- Show all donor story posts.

### 8.2 Posting donor stories
At the top, users can post what they want about their milestone.
- Submit button creates story.
- Content violating community guidelines may remove the post.

### 8.3 Viewing donor story
- Tap card → read story.
- Provide **Share this story** button.

---

## 9) Community — Announcements

- Can view all announcements from the DugoKo Team and PRC.

---

## 10) Learn Module

The learn module must contain **multiple articles** and be organized into tag categories:
- basics
- process
- myths

Flow:
1. Learn list shows articles by tag and summary.
2. Article detail screen shows full content.

---

## 11) Profile Module

### 11.1 Uploading profile picture
1. Tap image button.
2. Open gallery.
3. Select and upload.
4. Image displays.
5. Optional: tap delete to remove.

### 11.2 Hero Donor badge
- Tap badge → shows all donor badge list.

### 11.3 Edit Profile
- Edit details.
- Provide contact number input placeholder.
- Save changes.

### 11.4 Donation History
- Shows all donations logged (verified or unverified).
- Tap a donation card → opens receipt.
- If donation is verified:
  - print/download enabled
- If not verified:
  - print/download disabled
  - still allow sharing to other social media.

### 11.5 Settings → Reset Password
1. Open Reset Password screen.
2. Input email → sent OTP.
3. Input OTP for verification.
4. Verify OTP.
5. Set new password.
6. Password reset complete.
7. App logs user out automatically.
8. User logs in again using new password.

### 11.6 Logout
- Confirm logout.
- If confirm: log user out.
- If cancel: logout does not proceed.

---

## 12) Summary of MUST changes from previous flow draft

- Home recommendation card:
  - change **View Eligibility** → **I Can Help**
- “Unverified” donation card wording:
  - change from “pending”/“remain pending” to **subject for review**
- Community posting:
  - remove eligibility gating for **Blood Request** and **Donor Stories**
  - keep “I Can Help” response/eligibility flow intact
- Learn module:
  - must support multiple articles grouped by tags (basics/process/myths)

