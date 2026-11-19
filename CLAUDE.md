# MeetYourWhy — Project Spec & Build Guide

## What This Is

MeetYourWhy.com is a free web app that helps people discover what makes them who they are through an adaptive AI conversation (~15 minutes). Users answer by voice (typing as fallback). The experience reveals a **North Star** statement, a **Hidden Thread** connecting life moments, and a memorable **Archetype** — all grounded in the user's own stories and quotes.

The product must feel calm, emotionally intelligent, trustworthy, sophisticated, and deeply personal. AI helps people discover plausible interpretations of their experiences — it does not assert psychological truths.

## Product Vision

**Tagline:** Discover what makes you, you.

**Promise:** Understand yourself. Find your direction. Let the people who matter understand you better.

The product develops in two phases:
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
The original profile used 8 personality frameworks (Ikigai, MBTI-inspired, Big Five, Enneagram, VIA, Schwartz, RIASEC, life story). These are being replaced by the narrative dimensions above. Ikigai may be retained as an optional reflection lens. Formal psychometric frameworks are deferred — they require proper validated assessments that cannot be inferred from a short conversation.

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

### Stage 2B: Safety & Privacy Baseline (required before external testing)
- [ ] 18+ age confirmation before interview
- [ ] Distressing-disclosure detection and response protocol
- [ ] Curated crisis-resource config (with sources, last-verified dates)
- [ ] Verified deletion of raw audio after transcription
- [ ] Server-only transcript access, no transcripts in logs/analytics/errors
- [ ] Plain-language consent and privacy page
- [ ] Data deletion capability
- [ ] Test with scripted distress conversations

### Stage 3: Interview Intelligence & Evidence Engine
- [ ] New profile schema (life stories, drivers, values, strengths, tensions — versioned)
- [ ] Evidence records pointing to exact user statements
- [ ] Hypothesis generation with alternative interpretations
- [ ] Mirror moments with explicit user feedback (confirm/correct/reject)
- [ ] Revised interview system prompt (narrative-based)
- [ ] Improved stopping logic (~15 min, 12-18 questions)
- [ ] Test transcripts and evaluation scripts

### Stage 4: Discovery Report (launch scope: 3 results)
- [ ] North Star generation (editable, rejectable, alternatives)
- [ ] Hidden Thread (3 stories, quotes, theme, alternative interpretation)
- [ ] Archetype (name, description, evidence, limitations, user approval)
- [ ] Versioned report schema

### Stage 5: Results Reveal (mobile-first)
- [ ] Screen 1: North Star (edit/confirm)
- [ ] Screen 2: Hidden Thread (visual story timeline)
- [ ] Screen 3: Archetype (edit/confirm)
- [ ] Screen 4: Share step

### Stage 6: Minimal Sharing Loop
- [ ] One North Star card (1080×1920 Instagram Story format)
- [ ] User approval before anything becomes public
- [ ] Image download + native mobile share
- [ ] Minimal public share page (card + "Discover what makes you, you" CTA)
- [ ] Opaque, revocable share tokens
- [ ] Referral attribution events

### Stage 7: Saved Results, Analytics, Guardrails
- [ ] Supabase integration for secure result persistence
- [ ] Optional email/account for returning later (no mandatory marketing consent)
- [ ] Core analytics events (discovery + sharing funnels)
- [ ] Cost tracking, rate limits, bot protection, budget cap

### Stage 8: Tester Round (10-15 people)
- [ ] Run full experience with real testers
- [ ] Collect feedback: Do they feel understood? Are insights accurate? Do they share voluntarily?
- [ ] Fix critical issues
- [ ] Founder decides next direction

**Nothing beyond Stage 8 is built without explicit approval.**

### SUPERSEDED — Original Stages 3-7 (2026-11-19)
The original Stages 3-7 from the initial build plan have been superseded by the revised roadmap above. See `docs/STRATEGY_UPDATE_2026-11-19.md` for the full strategic context. Original stages covered: Final Report Generation, Results Page & PDF, Email Gate/Database, Share Card/Analytics, and Launch.

## Post-Launch Backlog (requires approval + evidence from testing)
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
