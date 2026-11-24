# MeetYourWhy — Project Spec & Build Guide

## What This Is

MeetYourWhy.com is a free web app that helps people discover what makes them who they are through an adaptive AI conversation (~15 minutes). Users answer by voice (typing as fallback). The experience reveals a **North Star** statement, a **Hidden Thread** connecting life moments, and a memorable **Archetype** — all grounded in the user's own stories and quotes.

The product must feel calm, emotionally intelligent, trustworthy, sophisticated, and deeply personal. AI helps people discover plausible interpretations of their experiences — it does not assert psychological truths.

## Product Vision

**Tagline:** Discover what makes you, you.

**Promise:** Understand yourself. Find your direction. Let the people who matter understand you better.

**The One Problem (launch focus):** People feel unseen, unsure what they're for, and alone with that. At launch we solve one part: helping one person feel genuinely understood about who they are and where they're going. Every launch decision serves that feeling. Sharing, growth and connection are secondary until testers confirm it.

**First Audience:** Adults at a work crossroads — people whose work is being changed by AI, who feel stuck in a role that feels empty, or who are starting a second act. First testers come from paid Instagram ads to cold traffic, not friends.

**Validation Gate (must pass before anything else counts):**
1. Do people feel genuinely understood?
2. Are insights accurate and grounded in their actual stories?

Bar: most completing testers name a specific line that made them think "how did it know that?" and rate "I felt understood" highly.

Secondary (learn, don't optimize yet): Can they correct inaccurate interpretations? Do they share without being asked? Do shared-with people click through and complete?

The product develops in two phases (long-term vision only — launch scope is defined by the one-problem statement and the 2026-11-21 addendum):
1. **Personal Discovery** (launch focus) — An adaptive AI conversation that discovers meaningful patterns in a person's stories, producing a North Star, Hidden Thread, and Archetype.
2. **Human Connection** (post-launch) — Two people who've completed discovery can voluntarily connect profiles to explore shared values, different motivations, and meaningful conversation questions.

**Principle: First help people understand themselves. Then help them understand each other.**

## The Interview

- Adaptive AI conversation, not a fixed quiz. About 15 minutes (12-18 questions as a guide).
- Voice input primary (OpenAI Whisper for transcription), typing as fallback.
- After each answer, the AI updates a hidden profile and chooses the next question:
  - Go deeper on a rich thread
  - Fill the least-known dimension
  - Probe a contradiction
- Questions are human story questions ("Tell me about a time…"), never personality-test style.
- **Mirror moments** around questions 5-7: AI reflects a tentative pattern; user can confirm, correct, or reject it. Rejections modify the working hypothesis.
- Interview should NOT force continuation just to fill every category.

## The Profile (Hidden During Interview)

### Primary dimensions (narrative-based)
1. **Life Stories** — peak experiences, childhood interests, turning points, accomplishments, flow moments, recurring roles
2. **Core Drivers** — what consistently creates motivation (creating, exploring, helping, teaching, building, connecting, solving, etc.)
3. **Personal Values** — what matters deeply, explored through actual decisions
4. **Demonstrated Strengths** — based on concrete examples, not self-assessment
5. **Internal Tensions** — meaningful differences between stated values and choices, competing motivations
6. **Possible Directions** — plausible directions worth exploring through real-world experiments
7. **The Hidden Thread** — recurring motivations across different life stages (the signature feature)

### Evidence requirements
- Every insight must have traceable supporting evidence with exact user quotes
- Each insight carries a confidence label: Emerging, Supported, Confirmed, Disputed, Insufficient
- Alternative interpretations must be considered
- The AI never invents quotes, memories, or motivations

### Frameworks approach
- **Ikigai's four circles** (love, good at, world needs, paid for) are the backbone of the North Star. The North Star comes from the strongest overlap.
- **Personality tendencies** (energy, information, decisions, structure) and **core drive / core fear** are internal listening lenses. Tracked in hidden interview state with evidence quotes and confidence levels. They feed the Archetype and the Hidden Thread.
- At launch, never display type codes, scores, or framework names to users. No trademarked names (Myers-Briggs, MBTI) anywhere user-facing.
- Human Design stays out.
- `docs/INTERVIEWER_PRINCIPLES.md` is the source of truth for interviewer behavior (required input to Stage 3). Its hidden-notes structure should be folded into the versioned profile and evidence schema.

## Launch MVP Output (3 results only)

1. **North Star** — A brief, personal, memorable purpose statement (<20 words). Editable, rejectable, with alternatives on request.
2. **Hidden Thread** — Connects up to 3 real stories with quotes, shows the recurring theme, explains why they may connect, offers an alternative interpretation. The main emotional reveal.
3. **Archetype** — A memorable identity label (e.g., "The Possibility Maker", "The Bridge Builder"). Short description, behavioral pattern, evidence, limitations, user approval.

Additional results (drivers, tensions, directions, next chapter, PDF) are **post-launch**.

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript, Tailwind CSS) |
| Hosting | Vercel |
| Database | Supabase |
| Voice transcription | OpenAI Whisper API |
| Interview AI | Anthropic claude-haiku-5-5 (fast loop) |
| Report AI | Anthropic claude-sonnet-5-5 (final report) |
| Share card images | Server-side rendering (1080x1920 Instagram Story) |
| Email | Resend |
| Analytics | PostHog |

## Design

Calm, warm, premium. Lots of whitespace. Mobile first. Think a quiet journal, not a tech product. Premium editorial aesthetic: warm neutral colors, elegant typography, generous whitespace, subtle motion.

## Build Stages

### Stage 0: Foundation ✅
- [x] CLAUDE.md with full spec
- [x] Next.js project scaffolded
- [x] Git initialized
- [x] .env.local template with all keys
- [x] GitHub repo: https://github.com/pierrepat/meetyourwhy
- [x] Vercel project: https://meetyourwhy.vercel.app (auto-deploys on push)
- [x] GitHub connected to Vercel (every push to main → production deploy)

### Stage 1: Landing Page & Interview Engine (Typed) ✅
- [x] Landing page (hero, how-it-works, CTA)
- [x] Interview UI (chat-like, one question at a time)
- [x] Interview engine: AI agent loop (profile + next question selection)
- [x] Text input for answers
- [x] Progress indicator
- [x] Interview end logic (time + confidence)

### Stage 2: Voice Input & Transcription ← CURRENT
- [ ] Microphone capture in browser (MediaRecorder API)
- [ ] OpenAI Whisper API integration (server-side)
- [ ] Voice → text with editable transcript before submission
- [ ] Recording UI: large mic button, timer, stop/retry, visual feedback
- [ ] Typed-answer fallback alongside voice
- [ ] Graceful microphone permission handling
- [ ] No raw audio storage (process and discard)
- [ ] Mobile browser testing (Safari, Chrome)
- [ ] Instagram in-app browser testing (iOS & Android): mic fallback, "Open in Safari/Chrome" prompt, typed fallback works
- [ ] English only for tester round (no i18n required yet, but avoid hardcoded strings where possible)

### Stage 2B: Safety & Privacy Baseline (required before external testing) ✅
- [x] 18+ age confirmation before interview
- [x] Distressing-disclosure detection and response protocol
- [x] Curated crisis-resource config (with sources, last-verified dates)
- [x] Verified deletion of raw audio after transcription
- [x] Server-only transcript access, no transcripts in logs/analytics/errors
- [x] Plain-language consent and privacy page
- [x] Data deletion capability
- [x] Test with scripted distress conversations

### Stage 3: Interview Intelligence & Evidence Engine ✅
- [x] New profile schema (Ikigai circles, tendencies, core drive/fear, natural role)
- [x] Evidence records pointing to exact user statements
- [x] Hypothesis generation with alternative interpretations
- [x] Mirror moments with explicit user feedback (confirm/correct/reject)
- [x] Revised interview system prompt (narrative-based)
- [x] Improved stopping logic (~15 min, 12-18 questions)
- [x] Interviewer principles (`docs/INTERVIEWER_PRINCIPLES.md`) integrated as source of truth
- [x] Ikigai four-circle tracking in hidden profile state (love, good_at, world_needs, paid_for, overlaps)
- [x] Personality tendency tracking (energy, information, decisions, structure) with lean/confidence/evidence
- [x] Core drive and core fear tracking with evidence
- [x] Coverage gaps tracking to guide question selection
- [x] System prompt rewritten to match interviewer-principles conversation arc and listening guidelines
- [x] Safety protocol in system prompt (under-18 handling, distress detection, session flagging)
- [x] Test suite (56 unit tests: JSON extraction, profile updates, phase logic, coverage)

### Stage 4: Discovery Report (launch scope: 3 results) ✅
- [x] North Star generation (editable, rejectable, alternatives)
- [x] Hidden Thread (3 stories, quotes, theme, alternative interpretation)
- [x] Archetype (name, description, evidence, limitations, user approval)
- [x] Versioned report schema

### Stage 5: Results Reveal (mobile-first) ✅
- [x] Screen 1: North Star (edit/confirm)
- [x] Screen 2: Hidden Thread (visual story timeline)
- [x] Screen 3: Archetype (edit/confirm)
- [x] Screen 4: Share step

### Stage 6: Minimal Sharing Loop (private-first)
- [x] Primary share action: "Send this to someone who knows you. Ask them: is this me?" via native share to messaging apps
- [x] Secondary: download Instagram Story card (1080×1920)
- [x] User approval before anything becomes public
- [x] Minimal public share page (card + "Discover what makes you, you" CTA) — Supabase + `/share/[token]` route
- [x] Opaque, revocable share tokens (Supabase `shared_results` table with UUID tokens, RLS, `revoked_at` column)
- [ ] Referral attribution events (referrer_token column exists, needs PostHog integration)
- [ ] `share_sent_privately` event (needs PostHog integration)

### Stage 7: Saved Results, Analytics, Guardrails
- [ ] Supabase integration for secure result persistence
- [ ] Optional email/account for returning later (no mandatory marketing consent)
- [ ] Core analytics events (discovery + sharing funnels)
- [ ] Cost tracking, rate limits, bot protection, budget cap

### Stage 7B: Ad Readiness (must complete before any ad goes live)
- [x] Instagram in-app browser support confirmed (mic fallback, "Open in Safari/Chrome", typed fallback)
- [x] UTM parameter capture at landing, attached to session (no personal data in URLs)
- [x] Funnel reporting by ad source and creative
- [x] Meta pixel: fire only `landing_view`, `discovery_start`, `interview_complete` — never send transcript/results/interpretations to Meta or any analytics provider
- [x] In-app feedback after reveal: "How understood?" (1-5), "Which line surprised you?" (free text), "What did it get wrong?" (free text), optional call opt-in with separate consent and email
- [x] Feedback stored separately from transcript, founder-only access
- [x] Daily AI budget cap, per-session limits, rate limiting, bot protection confirmed in production
- [x] Landing page matches ad promise, 18+ confirmation and privacy explanation shown before interview
- [x] Per-question drop-off visibility in funnel

### Stage 8: Tester Round (via Instagram ads)
- [ ] Testers recruited through paid Instagram ads to cold traffic (not friends)
- [ ] English only
- [ ] Run full experience with real testers
- [ ] Results judged against validation gate: Do people feel genuinely understood? Are insights accurate and grounded in their stories?
- [ ] Collect feedback via in-app mechanism (from Stage 7B)
- [ ] Fix critical issues
- [ ] Founder decides next direction

**Nothing beyond Stage 8 is built without explicit approval.**

### SUPERSEDED — Original Stages 3-7 (2026-11-19)
The original Stages 3-7 from the initial build plan have been superseded by the revised roadmap above. See `docs/STRATEGY_UPDATE_2026-11-19.md` for the full strategic context. Original stages covered: Final Report Generation, Results Page & PDF, Email Gate/Database, Share Card/Analytics, and Launch.

## Post-Launch Backlog (requires approval + evidence from testing)
- French and Spanish translations (moved from active stages — English only until after Stage 8)
- Additional results screens (drivers, tensions, directions, next chapter)
- PDF export
- Additional share cards (Archetype, What Drives Me, Something to Know About Me, Hidden Thread)
- Additional formats (1080×1350, 1080×1080) and visual themes
- Spark entry experiment (lightweight 2-3 min intro)
- Monetization: $29 Life Blueprint, price tests
- Extended action journeys
- Our Connection (two-person discovery)
- Know Me Better, Our Circle, annual recaps
- Subscriptions (only with evidence of recurring value)

## Safety & Trust (non-negotiable)

- **Not therapy.** Never frame or market the app as therapy, counseling, or a mental-health tool.
- **Adults only (18+).** Age confirmation required before interview.
- **Distress protocol.** Every turn checks for signals of acute distress. When detected: pause the flow, respond with compassion, offer to stop, provide crisis resources. Never turn distressing disclosures into insights or share content.
- **No raw audio storage.** Delete after transcription and verify deletion.
- **Privacy-first sharing.** All results are private by default. Nothing is public without explicit user approval. Users can revoke public links.
- **No fabrication.** The AI never invents quotes, memories, achievements, fears, or motivations.
- **No unsupported claims.** Don't present speculative inferences as facts or make scientific/psychological claims that cannot be established from a conversation.

## Rules

- **Keep this file updated** as decisions are made.
- Never commit real API keys. Use .env.local (gitignored).
- Mobile-first design for all UI work.
- Use App Router conventions (app/ directory, server components by default).
- Keep the interview AI prompt and profile schema in clearly separated files.
- The user (Pierre) is not a developer — explain any manual steps clearly.
- Do not start any future stage without founder approval.
- Preserve working code when making changes. No blind rewrites.
- Never send transcript text, results, or interpretations to Meta or any analytics provider.
