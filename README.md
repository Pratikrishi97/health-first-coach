# Health-First Coach

> Small actions. Personalized guidance. Lasting habits.

A premium, production-quality prototype of an adaptive digital health coaching product. Built with Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui, and Motion for React.

**Live demo:** https://health-first-coach.netlify.app
**Source:** https://github.com/Pratikrishi97/health-first-coach

> Tip: click **Demo Mode** (bottom-right) to explore the five prebuilt scenarios, or run through onboarding to generate your own personalized plan.

---

## Overview

Health-First Coach helps people turn health goals into sustainable daily behavior through personalized coaching, contextual recommendations, and progress feedback. The product is built around an **adaptive coaching engine** that learns from each user's behavior and continuously adjusts the plan — not a generic fitness dashboard with a chatbot attached.

## Product problem

People know they should eat better, exercise more, sleep better, and manage stress — but they struggle to consistently translate intent into behavior. Traditional human coaching provides accountability and personalization but is expensive and difficult to scale. Health-First Coach solves this by combining AI-powered conversational coaching with wearable data and behavior-change science.

## Target users

**Primary persona — Raj (35, busy professional):** Desk-based, frequently busy, uses smartphone and wearable, irregular exercise, inconsistent eating, often sleeps late. Wants better energy and long-term health without making health another job.

The architecture also supports:
- **Alice** — chronic-condition manager (structured routines, conservative recommendations, clinical escalation)
- **Emma** — wellness optimizer (fitness, nutrition, gamification)
- **George** — healthy-aging user (large-text mode, simpler UI, accessible navigation)

## Key product decisions

1. **Adaptive coaching** — the plan changes based on behavior. Miss morning workouts three times? The coach suggests a better time, not "try harder."
2. **One next best action** — the home screen surfaces a single specific small action you can take in the next hour, instead of dumping every metric on you.
3. **Behavior-first analytics** — we measure consistency, not vanity metrics. Progress is presented as a story.
4. **Safety-first AI** — the coach never diagnoses or prescribes. Medical questions trigger an explicit escalation pathway.
5. **Hybrid escalation** — AI first, human support when appropriate.
6. **Privacy-first** — prototype privacy controls, no fake certifications, real data export and deletion.

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
- **Light + dark** — a full dark theme (system-aware) with a toggle in the sidebar and Profile → Appearance

## Onboarding → live plan

Finishing the 7-step onboarding generates a **personalized starter plan** from your
answers — habits tuned to your goals, backfilled device metrics so the dashboard and
charts are alive from day one, a curated content library, a seeded timeline, and
contextual nudges. Progress and streaks start honest (near-zero) and grow as you show
up. Demo Mode remains available to jump straight into richer, pre-populated states.

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

### Netlify

A `netlify.toml` is included and uses the official `@netlify/plugin-nextjs` runtime
(SSR + API routes + static assets). No environment variables are required — the coach
engine is deterministic. Build command: `next build`, publish directory: `.next`.

## Demo scenarios

Click **Demo Mode** (bottom-right) to switch between:

1. **New user** — fresh onboarding, empty state
2. **Successful user** — high consistency, positive trends
3. **Struggling user** — several missed habits, coach adapts the plan
4. **Poor sleep** — sleep drops, coach recommends lighter activity
5. **Safety boundary** — coach safely escalates a medical question

## Future roadmap

- Real LLM integration via `/api/coach`
- Real wearable API integration (Apple HealthKit, Fitbit, Garmin, Oura)
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
