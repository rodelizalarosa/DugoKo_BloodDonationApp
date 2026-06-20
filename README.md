# DugóKo — UI/UX Build

This is a **UI/UX-only** build: every screen, component, and piece of data on
screen is real and navigable, but all data comes from `constants/mockData.ts`
instead of a live backend. Swap that file (and the small `lib/eligibility.ts`
calculation) for real API/database calls when you wire up the backend — the
screens themselves don't need to change.

## How to merge into your existing `Dugo_Ko` project

Your current folder already has `app/index.tsx` and the standard Expo
scaffold. To merge:

1. Delete the placeholder `app/index.tsx` Expo gives you by default.
2. Copy these folders into your project root, replacing/merging as needed:
   - `app/`
   - `components/`
   - `constants/`
   - `lib/`
   - `types/`
3. Merge `package.json` dependencies into your existing one (don't overwrite
   your `name`/other fields), then run:
   ```
   npm install
   ```
4. Merge `app.json`'s `"plugins": ["expo-router"]` and
   `"experiments": { "typedRoutes": true }` into your existing `app.json`.
5. Merge the `paths` alias from this `tsconfig.json` into yours so `@/` imports
   resolve.
6. Run `npx expo start`.

## Folder structure

```
DugoKo/
├── app/                          # expo-router file-based routes
│   ├── _layout.tsx                # Root stack
│   ├── (tabs)/                    # Bottom tab group
│   │   ├── _layout.tsx            # Tab bar config (5 tabs)
│   │   ├── index.tsx              # Home
│   │   ├── donate.tsx             # Donate hub
│   │   ├── community.tsx          # Community feed
│   │   ├── learn.tsx              # Learn list
│   │   └── profile.tsx            # Profile
│   ├── donate/
│   │   ├── eligibility.tsx        # Eligibility Checker (questionnaire)
│   │   ├── centers.tsx            # Find Donation Center
│   │   ├── events/
│   │   │   ├── index.tsx          # Blood Letting Events list
│   │   │   └── [id].tsx           # Event Details + RSVP
│   │   ├── log.tsx                # Log Donation ⭐
│   │   └── receipt.tsx            # Donation Receipt
│   ├── community/
│   │   └── [id].tsx               # Request/story detail + "I Can Help"
│   ├── learn/
│   │   └── [id].tsx               # Article detail
│   ├── profile/
│   │   ├── edit.tsx                # Edit / complete profile
│   │   └── history.tsx             # Full donation history
│   └── insight/
│       └── index.tsx               # AI Donor Insight detail
├── components/
│   ├── ui/                         # Card, Button, Badge, ScreenHeader, EmptyState
│   └── home/                       # GreetingCard, EligibilityCard, UpcomingEventCard,
│                                    # UrgentRequestCard, InsightCard, AskDonaFAB
├── constants/
│   ├── theme.ts                    # Design tokens (color, type, spacing, radius)
│   └── mockData.ts                 # Stand-in for the database, see schema below
├── lib/
│   └── eligibility.ts              # Eligibility date math (UI-side placeholder)
└── types/
    └── index.ts                    # Shared TypeScript models
```

## Step-by-step flow guide (for your own flowchart)

### HOME
```
Home
├── Greeting Card → (if profile incomplete) Complete Profile → Profile/Edit
├── Eligibility Card → Find Event → Donate Tab
├── Upcoming Event Card → View Event → Event Details → RSVP
├── Urgent Request Card → Help → Community Tab → Request Detail → I Can Help → Requester Notified
└── AI Donor Insight Card → View Details → Insight Detail Screen

FAB (Ask Dona, all pages)
└── Bottom Sheet → Search keyword/question → FAQ Database lookup → Answer + Disclaimer
```

### DONATE
```
Donate
├── Eligibility Checker → Questionnaire (5 yes/no) → Result
│     ├── Eligible → Find Center / See Events
│     └── Deferred → Learn Why (Learn article)
├── Find Donation Center → List/Map → Center Details → Call/Navigate
├── Blood Letting Events → Event Details → RSVP ("I'm Going") → Reminder
├── Attend Event (offline, physical donation)
├── Log Donation ⭐ → Fill Required + Optional fields → Save
│     → Update Total Donations → Recalculate Next Eligible Date
│     → Generate Insight → Generate Receipt
└── Donation Receipt → Share / Back to Donate
```

### COMMUNITY
```
Community
├── Feed (Requests / Stories / Announcements, newest first)
├── Tap a Request → Request Detail → "I Can Help" → Requester Notified
├── Tap a Story → Story Detail (read-only, encourages other donors)
└── Tap an Announcement → Announcement Detail
```
Data needed: `blood_requests`, `community_posts` (author, type, title, body,
postedAt, optional `relatedRequestId`).

### LEARN
```
Learn
├── Article List (category badge, summary, read time)
└── Tap Article → Article Detail (full content)
```
Data needed: `learn_articles` (title, category, summary, readMinutes,
content). Same `faq` table also backs Ask Dona, but Learn is long-form while
Ask Dona is short Q&A — kept as two tables since their content shapes differ.

### PROFILE
```
Profile
├── Identity header (avatar initial, name, donor level)
├── Stat row (blood type, total donations, level)
├── Edit Profile → Save → back to Profile
├── Donation History → full reverse-chronological list
└── My Receipts → reuses Donate's Receipt screen
```
Data needed: `users` table fields, plus a computed `donor_level` based on
`total_donations` thresholds (e.g. New < 3, Regular < 10, Hero < 25, Lifesaver
25+ — tune to your program).

## Is the Home/Donate plan overkill?

No — it's appropriately scoped for a donation app, not overkill. Each card
maps to exactly one decision point, and the Donate flow mirrors the real-world
sequence donors already go through (check eligibility → find a place →
attend → log → get proof). The one thing worth simplifying later if you want
leaner v1 scope: collapsing "Find Donation Center" and "Blood Letting Events"
into a single map/list with a filter toggle, since centers and events are
both just "places with a pin and a time." Kept separate here since you asked
for the original flow, but it's an easy merge if you want fewer taps.
