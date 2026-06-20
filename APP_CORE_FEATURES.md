# DugóKo — Core Features, End-to-End Flows, and Project Rules/Specifications

This document lists the **core features** of the DugóKo app and provides the **detailed flow** for each process, plus the **rules/specifications** that govern eligibility gating, posting, and core data models.

> Source of truth for specs/flows:
> - `README.md` (UI/UX-only, mock data, navigation + high-level flow)
> - `database/schema.sql` (canonical data model + enums/statuses)
> - `TODO.md` (community gating + donor story / blood request posting rules and remaining work items)

---

## 1) Project Scope & Data Model Rules

### 1.1 UI/UX-only build (current state)
- Every screen/component/navigation path is real and navigable.
- All displayed data comes from `constants/mockData.ts` (not a live backend).
- When a backend is added later:
  - You should swap mock data calls with real API/database calls.
  - The **screens themselves should not need major structural changes**.

### 1.2 Canonical domain data (database schema)
The `database/schema.sql` defines the intended Postgres-flavored backend model. Even though the current build uses mock data, these entities define the **real rules/specs** the UI should enforce.

#### Core enums (behavior-critical)
- `blood_type`: `O+ | O- | A+ | A- | B+ | B- | AB+ | AB-`
- `donor_level`: `New Donor | Regular Donor | Hero Donor | Lifesaver`
- `eligibility_status`: `eligible | deferred | not_eligible | unknown`
- `rsvp_status`: `going | interested | cancelled`
- `urgency_level`: `critical | urgent | moderate`
- `request_status`: `open | fulfilled | closed`
- `post_type`: `request | story | announcement`

---

## 2) Navigation & Screen Grouping (How the app is organized)

### 2.1 Route groups (expo-router)
Routes are defined via `app/` and `app/_layout.tsx` (stack + tabs). Core modules:

- Auth:
  - `app/auth/login.tsx`
  - `app/auth/register.tsx`
  - `app/auth/forgot-password.tsx`
  - `app/auth/otp.tsx`
  - `app/auth/reset-password.tsx`
- Tabs:
  - `app/(tabs)/` (tab bar config; 5 tabs)
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
  - `app/profile/settings.tsx`
  - `app/profile/history.tsx`
- Insight:
  - `app/insight/index.tsx`

---

## 3) Core Features (by domain)

## 3.1 Authentication (Auth module)

### Core feature goals
- Allow users to register and log in.
- Enable password recovery via OTP/reset flow.

### End-to-end flow (logical)
1. **Register** (`/auth/register`)
   - User enters identity credentials.
   - On completion, user proceeds to login (or OTP step depending on implementation).
2. **Login** (`/auth/login`)
   - User authenticates.
3. **Forgot password** (`/auth/forgot-password`)
   - User requests password reset.
4. **OTP verification** (`/auth/otp`)
   - User submits OTP.
5. **Reset password** (`/auth/reset-password`)
   - User sets a new password.
6. **Redirect** back to login.

> Backend mapping (schema): `users` table stores identity fields and donor profile fields (`blood_type`, `donor_level`, etc.). In a production build, auth should tie to `users.id`.

---

## 3.2 Donate module

### Core feature goals
Mirror real-world donation steps:
1) eligibility check → 2) find center → 3) attend events (RSVP) → 4) log donation → 5) receive receipt + next eligibility guidance → 6) generate insight.

### End-to-end flow A: Eligibility Checker → next steps
1. User opens **Donate hub** (`/(tabs)/donate`).
2. Tap **Eligibility Checker** → `/donate/eligibility`.
3. Complete eligibility questionnaire (5 yes/no in the UI).
4. App computes/derives an eligibility state:
   - `eligible`
   - `deferred` (with a day window / next eligible date)
   - `not_eligible` / `unknown` (as fallback)
5. UI routes decision:
   - If `eligible`: user can proceed to:
     - Find center
     - See events
   - If `deferred`: UI routes user to Learn explanations (Learn module).
   - If `not_eligible`: Learn/explanation pathway (and/or disable actions).

> Backend mapping (schema + rules):
- `eligibility_status` enum defines the states.
- The actual date math is represented in the UI-side `lib/eligibility.ts` placeholder today.

---

### End-to-end flow B: Find Donation Center
1. User opens `/donate/centers` from the Donate hub.
2. Browse a list of donation centers.
3. Center details provide:
   - address
   - contact
   - hours (when available)
4. User can initiate call/navigation (UI capability; actual integration can be added later).

> Backend mapping: `centers` table fields:
- `name`, `address`, `latitude`, `longitude`, `contact`, `hours`.

---

### End-to-end flow C: Events list → Event Details → RSVP
1. User opens **Blood Letting Events** list:
   - `/donate/events/index.tsx`
2. Select an event:
   - `/donate/events/[id].tsx`
3. View details:
   - title, date, time, venue, description
4. RSVP:
   - user chooses RSVP status (e.g., `going`, `interested`)
5. UI confirmation: RSVP saved (in mock build: local state; in backend: `event_rsvp`).

> Backend mapping:
- `events` table for event data
- `event_rsvp` table for RSVP state
- `event_rsvp` unique constraint: `(event_id, user_id)`

---

### End-to-end flow D: Attend (offline donation) → Log Donation ⭐ → Receipt
1. After attending donation, user goes to **Log Donation**:
   - `/donate/log.tsx`
2. Fill donation details (required + optional fields).
3. Save donation record:
   - creates a row in `donations`
4. Derived updates after save (production spec; UI should reflect this):
   - increment `users.total_donations`
   - update `users.last_donation_date`
   - recompute `users.donor_level`
   - update/produce `donor_insights`
5. App shows **Donation Receipt**:
   - `/donate/receipt.tsx`
6. Receipt displays:
   - next donation window / next eligible date
   - blood bag reference (if provided)
   - verification state (UI uses mock verification flow)
7. User can:
   - share receipt (optional UI integration)
   - navigate back to Donate

> Backend mapping:
- `donations` table (source of truth)
- Schema notes indicate trigger-worthy production behavior after `INSERT` on donations:
  - update user stats
  - recompute donor insights

---

## 3.3 Community module

### Core feature goals
Enable a community feed with:
- Blood Requests
- Donor Stories
- Announcements

Additionally:
- A request detail provides **“I Can Help”** action.
- Helper registration is gated and requires consent and required fields.

---

### End-to-end flow E: Community feed → Post detail
1. User opens Community tab:
   - `/ (tabs)/community.tsx`
2. Browse feed (requests/stories/announcements).
3. Tap a post card:
   - `/community/[id].tsx`
4. UI renders post-specific detail and actions:
   - Request detail shows “I Can Help” entry point
   - Story detail is read-only + prompts sharing/engagement
   - Announcement detail provides info

> Backend mapping: `community_posts`
- `post_type` determines which UI surfaces

---

### End-to-end flow F: “I Can Help” → Helper Registration → Confirmation
1. From a **blood request post detail** (`/community/[id].tsx`), user taps **I Can Help**.
2. App opens Helper Registration Modal:
   - `components/community/HelperRegistrationModal.tsx`
3. Modal collects required fields:
   - Full name
   - Contact number
   - Red Cross health check consent (checkbox)
4. On submit:
   - Show confirmation message
   - Disclaimer/out-of-scope communication statement
   - Store helper display fields for UI
5. In production, this should create a response record:
   - `request_responses` row linking helper/user to `blood_requests.id`

> Backend mapping:
- `request_responses`:
  - `request_id`
  - `user_id`
  - unique constraint `(request_id, user_id)` ensures one response per user per request.

---

## 3.4 Posting Eligibility Gating (Community create flows)

This is explicitly tracked in `TODO.md`.

### Rule: gating before creating posts
Eligibility checks must gate the ability to open posting modals:
- Blood Requests posts creation
- Donor Stories posts creation

Behavior:
- If eligible:
  - allow opening the posting modal/form
- If deferred/not eligible:
  - show message with eligibility state (if available)

> Status according to `TODO.md`:
- Step 3: Eligibility check gate for creating requests/stories is marked **[x] done**.

---

### End-to-end flow G: Create “Blood Request” post (eligibility gated)
1. User attempts to open create entry point from:
   - Community tab screen (`app/(tabs)/community.tsx`) (**Step 5 pending**)
   - Or from post detail for certain entry points (**Step 5 pending**)
2. Eligibility gate runs:
   - uses eligibility state derived from questionnaire / donor status
3. If eligible:
   - open `DonorStoryCreateModal` or Blood Request create modal (blood request modal exists in components; TODO refers to adding form)
4. User completes required fields (TODO Step 4 specifies):
   - Hospital name + location (required)
   - Blood type (required)
   - Units of blood (required)
   - When blood is needed (required: accepts “today”, specific date/time, etc.)
5. Optional fields:
   - additional patient info (optional)
   - additional notes (optional; e.g., willingness to pay)
6. On submit (current spec intent):
   - create a local community post object (mock) with triage fields

> Remaining work in `TODO.md` (explicit):
- Implement required + optional fields: **[ ]**
- Add AI urgency/triage derived from “when blood is needed”: **[ ]**
- On submit: create local community post with triage fields: **[ ]**

---

### End-to-end flow H: Create “Donor Story” post (eligibility gated)
1. User attempts to open story creation entry.
2. Eligibility gate runs (Step 3 done).
3. If eligible:
   - open story modal: `components/community/DonorStoryCreateModal.tsx`
4. User fills story content.
5. On submit:
   - create mock community post object (story).

> Note:
> The exact story field requirements are not fully expanded in `TODO.md`, but gating is implemented (Step 3 done).

---

## 3.5 Learn module

### Core feature goals
Provide long-form informational content donors can read:
- list of articles
- article detail view

### End-to-end flow I: Learn list → Article detail
1. User opens Learn tab:
   - `/ (tabs)/learn.tsx` (list screen)
2. Browse article cards (category badges, summary, read time)
3. Tap an article:
   - `/learn/[id].tsx`
4. Read full content.

> Backend mapping:
- `learn_articles` table:
  - `title`, `category`, `summary`, `read_minutes`, `content`, `published_at`, `cover_emoji`

---

## 3.6 Insight module

### Core feature goals
Display AI-derived or computed donation insights.

### End-to-end flow J: Home → Insight card → Insight detail
1. Home screen shows AI Donor Insight card.
2. Tap card:
   - `/insight/index.tsx`
3. Insight detail:
   - uses eligibility/eligibility formatting (`formatDate` referenced in code)
   - uses `ThemeContext` for tone/styling

> Backend mapping:
- `donor_insights` table can cache derived insight fields per user:
  - `total_donations`, `estimated_lives_impacted`, `donation_streak`, `next_window_date`

---

## 4) Home Module Detailed Flow (Decision-based navigation)

### End-to-end flow K: Home cards
Home (`/(tabs)/index.tsx`) presents decision points:

1. **Greeting Card**
   - If profile incomplete:
     - user is directed to `Profile/Edit` (`/profile/edit.tsx`)
   - Else:
     - user stays on home and sees other cards
2. **Eligibility Card**
   - “Find Event” leads into Donate flow
   - Navigate to Donate tab and then to Eligibility Checker
3. **Upcoming Event Card**
   - opens event detail → RSVP flow
4. **Urgent Request Card**
   - “Help” leads to Community tab
   - request detail → “I Can Help” → helper registration → confirmation
5. **AI Donor Insight Card**
   - navigates to Insight detail screen

---

## 5) Rules/Specifications Checklist (what must be enforced)

### 5.1 Community creation gating (MUST)
From `TODO.md` Step 3:
- Blood Requests creation and Donor Stories creation are gated by eligibility.
- If eligible → allow open/create.
- If deferred/not eligible → show eligibility message and block creation.

### 5.2 Helper registration required fields (MUST)
From `TODO.md` Step 2:
- Full name (required)
- Contact number (required)
- Red Cross health check consent checkbox (required)
On submit:
- show warning/confirmation
- communication/out-of-scope disclaimer
- store helper display fields for UI

### 5.3 Database integrity constraints (MUST in backend)
From `database/schema.sql`:
- `event_rsvp` unique: `(event_id, user_id)`
- `request_responses` unique: `(request_id, user_id)`
- `users.blood_type` uses `blood_type` enum
- `community_posts.post_type` uses `post_type` enum
- `blood_requests.status` uses `request_status`

### 5.4 Eligibility-derived status (MUST in backend logic)
From `database/schema.sql`:
- Eligibility states must be drawn from:
  - `eligible | deferred | not_eligible | unknown`
- UI logic should interpret:
  - `deferred` → show next-window guidance
  - `eligible` → allow donation actions and posting creation

---

## 6) Core Processes Summary (one-line flow map)

- **Auth**: Register → Login → Forgot Password → OTP → Reset Password
- **Donate**:
  - Eligibility Questionnaire → Eligible/Deferred → Centers/Events
  - Events → Event Detail → RSVP
  - Offline Donation → Log Donation → Receipt (next eligible date + details)
- **Community**:
  - Feed → Post Detail → Request Detail → “I Can Help” → Helper Registration Modal → confirmation
  - Create Post (Request/Story) is eligibility-gated
- **Learn**: Learn List → Article Detail
- **Insight**: Home Insight Card → Insight Detail
- **Profile**:
  - Profile header/status → Edit profile → History / Receipts access

---

## 7) Current Implementation Gaps (as per TODO.md)

The following steps are still incomplete:

- Step 4 (Blood Request creation form):
  - Required + optional fields implementation: **incomplete**
  - AI urgency/triage derived from “when blood is needed”: **incomplete**
  - Submit behavior to create local community post with triage fields: **incomplete**
- Step 5 (UI wiring for create entry points):
  - Add Blood Request / Donor Story “create” entry points on:
    - Community tab screen (`app/(tabs)/community.tsx`): **incomplete**
    - Post detail screen (`app/community/[id].tsx`) for “I Can Help” button modal behavior: **incomplete**
  - Update community detail to use modal for “I can help” rather than local toggles: **incomplete**
- Step 6 (sanity checks):
  - Typecheck/build: **pending**
  - Manual UI walkthrough: **pending**
