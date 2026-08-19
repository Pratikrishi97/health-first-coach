# Health-First Coach

> Your health plan should fit your life — not the other way around.

A premium, production-quality prototype of an **adaptive digital health coaching product** that personalizes the plan around your real life. Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, and Motion for React.

---

## Overview

Health-First Coach is an adaptive health coach that understands your health **AND** your real life. The product is built around a **Life-Aware Adaptation Engine** that combines health signals, life context, calendar, and behavior history to produce "the healthiest realistic version of today."

The core promise: **your plan should fit your life — not the other way around.**

## The 6 Differentiating Capabilities

### 1. Life-Aware Adaptive Plan (Primary Differentiator)
The plan adapts to your real day — sleep, schedule, travel, energy. Busy day? Workout moves to 6:30 PM. Travel? Switches to portable bodyweight. Poor sleep? Becomes lighter. Not "try harder" — try smarter.

- **Life Context Engine** — quick chips (busy, travel, low_energy, high_stress) + natural language input ("I have a wedding this weekend" → social event context)
- **Simulated calendar** — coach detects time conflicts and moves workouts
- **Adaptive plan view** — morning/lunch/evening items with tap to complete/modify/skip + layout animations
- **Plan adaptation banner** — "Plan adapted: [trigger] / What changed / Why / Accept or use normal"

### 2. Recovery Mode / No-Guilt Engine
Two disrupted days? Instead of "streak broken," the coach resets today to something achievable and tells you: "Your progress is not reset."

- **Recovery consistency** metric (replaces streak pressure)
- **Recovery plan** — Today (10-min walk) → Tomorrow (15-min) → Thursday (return to normal)
- **Compassionate copy** — "Your routine took a pause. That's not failure — that's information."
- Auto-triggers on repeated misses, low sleep + high stress, or schedule disruption

### 3. "Why?" Health Interpreter
Every recommendation comes with the reasoning, data used, and confidence behind it. Tap "Why this?" to open a bottom sheet with:
- Recommendation
- Why (bullet reasons)
- Data used (transparency badges)
- Confidence (low/moderate/high with progress bar)
- User control (alternative / override)

### 4. Friction Autopilot
If your wearable shows low activity, we don't ask "did you exercise?" We ask "did today get busy?" — and adapt. Less logging, more living.

- **Smart infer-instead-of-ask** questions
- **One-tap context chips** (<3 seconds)
- **Natural language input** with keyword detection

### 5. Coach Silence + Trust Layer
The coach is not omnipresent. Five modes: Active, Quiet, Focus, Recovery, Off. The coach knows when not to talk.

- **"Should I speak?" decision layer** — usefulness × novelty × (1 - notification burden)
- Only HIGH priority + high confidence messages surface proactively
- Trust panel on every recommendation: Why / Data used / Confidence / User control

### 6. Long-Term Adaptive Planning (Quarter → Month → Week → Today)
A connected planning hierarchy that makes the user's health journey understandable at every time horizon while ensuring daily actions remain adaptive to real life.

- **Quarter view** — primary objective, quarterly outcomes with baseline/target/current/trend/confidence, monthly milestones timeline
- **Month view** — monthly goals with current/target/projected, adjustment recommendations ("Accept adjustment" when behind)
- **Week view** — day-by-day schedule with complete/move/skip/replace, plan health status, reschedule dialog
- **Today view** — integrated as the lowest level of the hierarchy with breadcrumb navigation
- **Plan cascading** — changing a higher-level target updates lower-level planning; a day-level change preserves weekly/monthly/quarterly targets
- **Plan status logic** — On track / Adapted / Needs attention / At risk / Completed (never "Failed" or "Broken streak")
- **Planning insights** — AI-generated observations and recommendations per horizon
- **Breadcrumb navigation** — Q3 → September → Week 2 → Today with animated transitions

## Product problem

People know they should eat better, exercise more, sleep better, and manage stress — but they struggle to consistently translate intent into behavior. Existing systems (Fitbit, Garmin, Oura, Apple Health) personalize based on health signals but ignore life context. Health-First Coach solves this by building a **Life Context Engine** that adapts the plan around your real day.

## Target users

**Primary persona — Raj (35, busy professional):** Desk-based, frequently busy, uses smartphone and wearable, irregular exercise, inconsistent eating, often sleeps late. Wants better energy and long-term health without making health another job.

## Key product decisions

1. **Life-aware adaptive plan** — the plan adapts to sleep, schedule, travel, energy — not just health metrics
2. **Recovery Mode, no guilt** — "streak broken" becomes "today got disrupted, let's adjust"
3. **"Why?" health interpreter** — every recommendation is explainable with data + confidence
4. **Friction autopilot** — don't ask users to log what we can infer
5. **Controlled coach** — 5 modes, "should I speak?" filter, never spammy
6. **Safety-first AI** — the coach never diagnoses or prescribes. Medical questions trigger an explicit escalation pathway.
7. **Privacy-first** — prototype privacy controls, no fake certifications, real data export and deletion.

## Feature overview

- **Landing page** with animated hero, interactive product preview, and 9 differentiators
- **7-step onboarding** that builds a personalized plan in 3–5 minutes
- **Home dashboard** with Daily Balance score (explainable), next best action, habit cards, coach insight, weekly momentum, and timeline preview
- **AI Coach** with streaming-style messages, context chips, "Why this works" insights, and actionable coach cards
- **Habits** with adjust/pause/replace and a habit detail sheet
- **Progress** as storytelling — animated consistency chart, 14-day movement, sleep + stress charts, observed patterns with "How was this calculated?"
- **Learn** — curated content library with "Recommended for you" personalization
- **Timeline** — chronological narrative of your health journey
- **Weekly Review** — week-in-review + next-week plan builder
- **Plan Lab** — interactive plan modifier with estimated impact based on your behavior
- **Profile, Privacy, Devices, Safety, Nudges** — full trust + control center
- **Demo Mode** with 5 scenarios (new, successful, struggling, poor sleep, safety)
- **Analytics debug panel** showing real events

## UX philosophy

- **Premium, calm, human** — Apple Health × Oura × Linear aesthetic
- **Progressive disclosure** — surface the most useful next action, not every metric
- **Motion is intentional** — spring physics, staggered entrances, reduced-motion support
- **Mobile-first** — fully responsive 320/375/768/1024/1440
- **Accessibility** — keyboard nav, ARIA labels, large-text mode, reduced-motion

## AI architecture

The coach engine is intentionally **deterministic and rule-based** so the prototype works without an LLM API key:

```
USER CONTEXT
     ↓
HEALTH SIGNALS
     ↓
BEHAVIOR HISTORY
     ↓
COACHING ENGINE (context builder + intent classifier + 6 personalization rules + style adapter)
     ↓
NEXT BEST ACTION
     ↓
USER ACTION
     ↓
OUTCOME
     ↓
LEARNING
     ↓
UPDATED PLAN
```

The `/api/coach` route wraps this engine. When a real LLM API key is configured, the same context + safety filter can wrap an LLM response — the architecture is unchanged.

## Personalization engine

6 rules detect:
- Low sleep (< 6h) → lighter day
- High completion (≥ 80%) → suggest progression
- Low completion (< 40%) → reduce target
- Missed same habit 3+ times → suggest new timing
- High stress (≥ 65) → surface stress reset
- Goal hit → celebrate + propose next step

Coaching style (gentle / encouraging / direct / data) visibly changes the copy.

## Safety model

Hard boundaries: no diagnosis, no prescription, no emergency instructions. Pattern-based safety filter flags medical, mental-health, and emergency inputs and returns a calm escalation pathway with "Find support" and "Continue wellness coaching" options.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **State**: Zustand + localStorage persistence
- **Animation**: Motion for React (framer-motion)
- **Charts**: Recharts
- **Icons**: Lucide
- **Database**: Prisma (configured, optional)

## Local setup

```bash
bun install
bun run dev
```

Open http://localhost:3000

## Environment variables

No environment variables required for the prototype. The coach engine is deterministic.

For LLM integration (optional):
```
# .env.local
ZAI_API_KEY=...
```

## Deployment

The app is a standard Next.js project. Deploy to Netlify, Vercel, or any Next.js-compatible host.

```bash
bun run build
bun run start
```

## Demo scenarios

Click **Demo Mode** (bottom-right) to switch between:

1. **New user** — fresh onboarding, empty state
2. **Normal day** — high consistency, positive trends. The baseline experience.
3. **Busy workday** — back-to-back meetings. Plan adapts — workout moved to 6:30 PM.
4. **Travel day** — on the move. Plan switches to portable bodyweight routine.
5. **Poor sleep** — sleep 5h 12m. Plan becomes lighter. Recovery mode activates.
6. **Repeated missed habits** — two disrupted days. Recovery Mode + no-guilt engine.
7. **Recovery mode** — active recovery. Coach in Recovery mode — only recovery suggestions.
8. **Medical boundary** — ask the coach "Should I change my medication?" to see safe escalation.

## What is real vs simulated

**Real (working):**
- All 5 differentiating capabilities (Life-Aware Plan, Recovery Mode, Why Interpreter, Friction Autopilot, Coach Silence)
- Adaptation engine with 7 rule types (low_sleep, busy, travel, recovery, high_stress, high_completion, low_completion, calendar_block)
- State persistence via localStorage
- Mobile-first responsive design
- Reduced-motion support
- Safety escalation for medical questions
- Analytics instrumentation

**Simulated (prototype):**
- Wearable device sync (mock data)
- Calendar integration (simulated events, clearly labeled)
- LLM coach (deterministic engine instead)
- Human coach scheduling (placeholder)
- Real-time notifications (mock proactive messages)

**Future production work:**
- Real LLM via `/api/coach` (architecture supports it)
- Real wearable APIs (Apple HealthKit, Fitbit, Garmin, Oura)
- Real calendar integration (Google Calendar, Outlook)
- B2B employer dashboard
- Clinical-grade predictive models
- Regulatory compliance review (HIPAA, GDPR)

## Future roadmap

- Real LLM integration via `/api/coach`
- Real wearable API integration (Apple HealthKit, Fitbit, Garmin, Oura)
- Real calendar integration (Google Calendar, Outlook)
- B2B employer dashboard
- B2B2C health-plan partnerships
- Clinical-grade predictive models
- International localization
- Human coach scheduling with real availability
- Family plans

## Regulatory positioning

Health-First Coach is positioned as **wellness + behavior-change coaching**. It does not diagnose, treat, or claim to prevent disease. Production deployment would require appropriate regulatory, clinical, privacy, and security review.

---

*Not a medical device. Not HIPAA certified. Designed with privacy and safety principles in mind.*
