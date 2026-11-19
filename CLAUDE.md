# MeetYourWhy — Project Spec & Build Guide

## What This Is

MeetYourWhy.com is a free web app that helps people find their purpose and North Star through an adaptive AI interview (~15 minutes). Users answer by voice (typing as fallback). The output is a beautiful results page and downloadable PDF with their North Star statement, personality profile, Ikigai map, blind spots, directions, and a 30-day action plan — all grounded in their own quotes.

## Product Details

### The Interview
- Adaptive AI conversation, not a fixed quiz. About 15 minutes.
- Voice input primary (OpenAI Whisper for transcription), typing as fallback.
- After each answer, an AI agent updates a hidden profile and chooses the next question:
  - Go deeper on a rich thread
  - Fill the least-known dimension
  - Probe a contradiction
- Questions are human story questions ("Tell me about a time…"), never personality-test style ("Are you an introvert?").

### The Profile (Hidden During Interview)
Blends these frameworks:
- **Ikigai**: love, skill, need, paid-for
- **16-type personality**: inspired by Myers-Briggs (never call it MBTI in the UI)
- **Big Five traits**: openness, conscientiousness, extraversion, agreeableness, neuroticism
- **Enneagram-style core motivation**
- **VIA character strengths**
- **Schwartz values**
- **Holland RIASEC career interests**
- **Life story / flow moments**
- **Human Design**: optional add-on requiring birth date, time, and place

### Interview End Conditions
- ~15 minutes elapsed, OR
- Every dimension reaches a confidence threshold

### Output
- Beautiful results page
- Downloadable PDF containing:
  - North Star statement
  - Personality profile
  - Ikigai map
  - Blind spots
  - Directions
  - 30-day action plan
  - Grounded in the user's own quotes
- Shareable result card (for social posting of North Star + type)
- Email required to receive the PDF
- Product is free

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, TypeScript, Tailwind CSS) |
| Hosting | Vercel |
| Database | Supabase |
| Voice transcription | OpenAI Whisper API |
| Interview AI | Anthropic claude-haiku-5-5 (fast loop) |
| Report AI | Anthropic claude-sonnet-5-5 (final report) |
| PDF generation | @react-pdf/renderer |
| Email | Resend |
| Analytics | PostHog |

## Design

Calm, warm, premium. Lots of whitespace. Mobile first. Think a quiet journal, not a tech product.

## Build Stages

### Stage 0: Foundation ✅
- [x] CLAUDE.md with full spec
- [x] Next.js project scaffolded
- [x] Git initialized
- [x] .env.local template with all keys
- [x] GitHub + Vercel deployment guide

### Stage 1: Landing Page & Interview Engine (Typed)
- [ ] Landing page (hero, how-it-works, CTA)
- [ ] Interview UI (chat-like, one question at a time)
- [ ] Interview engine: AI agent loop (profile + next question selection)
- [ ] Text input for answers
- [ ] Progress indicator
- [ ] Interview end logic (time + confidence)

### Stage 2: Voice Input & Transcription
- [ ] Microphone capture in browser
- [ ] OpenAI Whisper API integration
- [ ] Voice → text with fallback to typing
- [ ] Audio feedback (recording indicator, playback)

### Stage 3: Final Report Generation
- [ ] Profile → North Star statement (claude-sonnet-5-5)
- [ ] Personality profile narrative
- [ ] Ikigai map data
- [ ] Blind spots analysis
- [ ] Directions and 30-day action plan
- [ ] Quote extraction and attribution

### Stage 4: Results Page & PDF
- [ ] Results page design (sections, visualizations, quotes)
- [ ] @react-pdf/renderer PDF generation
- [ ] PDF download endpoint

### Stage 5: Email Gate, Delivery, Database
- [ ] Supabase schema (users, sessions, profiles, results)
- [ ] Email collection gate before PDF
- [ ] Resend integration for PDF delivery
- [ ] Session persistence

### Stage 6: Share Card, Analytics, Cost Guardrails
- [ ] OG image / share card generation
- [ ] Social sharing flow
- [ ] PostHog analytics integration
- [ ] API cost monitoring and rate limiting
- [ ] Abuse prevention

### Stage 7: Launch
- [ ] Domain setup
- [ ] SEO meta tags
- [ ] Performance audit
- [ ] Final QA

## Rules

- **Keep this file updated** as decisions are made.
- Never commit real API keys. Use .env.local (gitignored).
- Mobile-first design for all UI work.
- Use App Router conventions (app/ directory, server components by default).
- Keep the interview AI prompt and profile schema in clearly separated files.
- The user (Pierre) is not a developer — explain any manual steps clearly.
