# MEETYOURWHY: STRATEGY ADDENDUM (2026-11-21)

This addendum updates `docs/STRATEGY_UPDATE_2026-11-19.md`. **Where the two conflict, this addendum wins.** Everything not mentioned here stays as written.

How to apply it: start in Plan Mode, read this file and the strategy update, propose the exact edits to `CLAUDE.md` and `docs/ROADMAP.md`, and wait for my approval before editing files or code.

---

## A1. The one problem (add at the top of Section 0)

> People feel unseen, unsure what they're for, and alone with that. At launch we solve one part of it: helping one person feel genuinely understood about who they are and where they're going. Every launch decision serves that feeling. Sharing, growth and connection are secondary until testers confirm it.

Add a note to Section 1 (vision) and the Final Instruction: *"Long-term vision only. Launch scope is defined by Section 0 and the 2026-11-21 addendum."*

When a feature or task doesn't clearly serve the one problem, defer it and say so.

## A2. First audience and acquisition

- **Acquisition:** the first testers come from paid Instagram ads to cold traffic, not friends.
- **Audience (working choice, founder may change):** adults at a work crossroads. People whose work is being changed by AI, who feel stuck in a role that feels empty, or who are starting a second act.
- **Implications:**
  - Landing page copy, the interviewer's warm open, and example wording speak to this audience.
  - Users are strangers. We cannot interview them afterwards unless they opt in, so the app must collect feedback itself (A7).
  - Expect much higher drop-off than with friends. Plan for many more starts than the 10 to 15 completions we need.

## A3. Validation gate (replaces the order of Section 0.2)

**Primary gate (must pass before anything else counts):**
1. Do people feel genuinely understood?
2. Are insights accurate and grounded in their actual stories?

Bar: most completing testers can name a specific line that made them think "how did it know that?", and rate "I felt understood" highly.

**Secondary (learn, don't optimize yet):**
3. Can they correct inaccurate interpretations?
4. Do they share without being asked?
5. Do the people they share with click through and complete?

A good share rate does not count as success if the primary gate fails.

## A4. Frameworks (replaces Section 6)

- **Ikigai's four circles are the backbone of the North Star:** love, good at, world needs, paid for. The North Star comes from the strongest overlap.
- **Personality tendencies** (energy, information, decisions, structure) and **core drive / core fear** are **internal listening lenses**. Track them in hidden interview state with evidence quotes and a confidence level. They feed the Archetype and the Hidden Thread.
- **At launch, never display** type codes, scores, or framework names to users, and use no trademarked names (Myers-Briggs, MBTI) anywhere user-facing.
- Human Design stays out.
- Add `docs/INTERVIEWER_PRINCIPLES.md` (provided separately) as the source of truth for interviewer behavior. It is a required input to Stage 3. Fold its hidden-notes structure into the versioned profile and evidence schema rather than creating a parallel one.

## A5. English only for the tester round

- Keep the architecture ready for translation (no hardcoded strings where avoidable).
- Build, test and evaluate the interview, results and card in **English only** until after Stage 8.
- Remove the French and Spanish requirements from the Stage 2 and Stage 6 done-when criteria for now. Move them to the post-launch backlog.
- Ads target English-speaking countries.

## A6. Share step: personal first, public second (modifies Stage 6)

- Primary action: **"Send this to someone who knows you. Ask them: is this me?"**, using native share to a messaging app.
- Secondary action: download the Instagram Story card (1080 × 1920). Card spec unchanged.
- Replace Section 3, Step 7 ("invite a friend") with this prompt.
- Add event: `share_sent_privately` (native share started from the private prompt). No content in event properties.

## A7. New stage: 7B, Ad readiness (must be done before any ad goes live)

Build:

1. **Instagram in-app browser support.** Add the Instagram in-app browser on iOS and Android to the Stage 2 test devices. If microphone access fails or isn't supported there, show a clear "Open in Safari / Chrome" option and make the typed fallback obvious. The user should never get stuck.
2. **Ad source attribution.** Capture UTM parameters at landing and attach them to the session (no personal data in URLs). Report the funnel by ad and creative.
3. **Meta pixel / conversion events, minimal.** Fire only `landing_view`, `discovery_start` and `interview_complete`. Never send transcript text, results, or interpretations to Meta or any analytics provider. Do not load the pixel on results pages if it can be avoided.
4. **In-app feedback after the reveal.** Short and optional:
   - "How understood did you feel?" (1 to 5)
   - "Which line, if any, made you think 'how did it know that?'" (free text)
   - "What did it get wrong?" (free text)
   - "Would you do a 15-minute call about your experience?" (separate opt-in with email, separate consent, never bundled)
   Store feedback separately from the transcript, with the same access protections.
5. **Spend and abuse protection live:** daily AI budget cap, per-session limits, rate limiting and bot protection from Stage 7 must be confirmed working in production.
6. **Landing page matches the ad promise.** Show the 18+ confirmation and the plain-language privacy explanation before the interview starts (from Stage 2B).
7. **Drop-off visibility:** per-question drop-off in the funnel, so we can see where cold traffic leaves.

### Done when

- The full flow works from an Instagram ad click on iPhone and Android, including the fallback when the mic isn't available.
- A test session's ad source shows correctly in analytics.
- A search of Meta events and analytics finds no transcript or result content.
- Feedback submissions are saved and readable by the founder only.
- The daily budget cap has been triggered once in a test and behaves gracefully.

## A8. Public share page and attribution: keep, minimal

Because testers are strangers, keep Stage 6's public share page and referral attribution. It's the only way to answer validation question 5. Keep it as minimal as Section 26 describes. No extra features.

## A9. Small cleanups

- Section 3, Step 5: add a launch-scope note. Launch shows three results only (North Star, Hidden Thread, Archetype).
- Section 3, Step 7: replaced by A6.
- Stage 8: testers are recruited through Instagram ads (A2). Results are judged against the A3 gate.

## A10. Revised active stage order

1. **Stage 2:** Voice input (now includes the Instagram in-app browser tests).
2. **Stage 2B:** Safety and privacy baseline.
3. **Stage 3:** Interview intelligence and evidence engine (uses `docs/INTERVIEWER_PRINCIPLES.md`).
4. **Stage 4:** Discovery report (North Star, Hidden Thread, Archetype).
5. **Stage 5:** Results reveal.
6. **Stage 6:** Minimal sharing loop (private-first, per A6).
7. **Stage 7:** Saved results, funnel analytics, guardrails.
8. **Stage 7B:** Ad readiness (A7).
9. **Stage 8:** Tester round via Instagram ads, judged against A3.

Nothing after Stage 8 is built without explicit founder approval.
