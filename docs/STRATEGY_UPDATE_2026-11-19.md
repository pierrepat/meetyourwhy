# MEETYOURWHY — MASTER PRODUCT UPDATE & CLAUDE.md REVISION (with final launch refinements, 2026-11-19)

## YOUR ROLE

You are acting as the founding CTO, senior product architect, UX designer, AI engineer, growth engineer, and privacy-conscious technical lead for **meetyourwhy.com**.

We are making a substantial strategic update to the existing product.

**IMPORTANT: This is an existing project, not a new build.**

We are currently at **Stage 2: Voice Input** of the original build plan, titled *meetyourwhy.com Build Plan and Claude Code Prompts*, dated November 19, 2026.

Stages 0 and 1 have been worked on. Stage 2 is currently in progress. Do not assume every earlier requirement is implemented correctly; inspect the repository and verify.

Your immediate assignment is to:

1. Inspect the entire existing codebase and `CLAUDE.md`.
2. Understand what has been implemented, what is partially implemented, and what remains.
3. Preserve working code, configurations, database structures, API integrations, environment variables, and completed functionality.
4. Update `CLAUDE.md` to reflect the new product vision, technical requirements, product priorities, and revised development roadmap.
5. Create or update a detailed implementation backlog with dependencies and acceptance criteria.
6. Identify any necessary changes to previously completed stages.
7. Continue Stage 2 with the smallest sensible changes needed to support the updated architecture.
8. Do not start building later-stage features until the revised plan has been reviewed and approved.

Do not blindly replace files, rebuild the application from scratch, or make destructive database changes.

Start in Plan Mode. Present your findings and proposed changes before implementing significant modifications.

We want a product that feels extraordinarily personal, is genuinely useful, encourages natural social sharing, and eventually becomes more valuable when close friends or partners also use it.

Our ambition is to create a world-class consumer product, not simply an attractive AI questionnaire.

---

# 0. FINAL STRATEGIC REFINEMENTS (THESE TAKE PRECEDENCE)

These refinements were added after the rest of this document was written. **Where anything later in this document conflicts with Section 0, Section 0 wins.** Later sections describe the long-term vision; Section 0 defines what we actually build now.

Our immediate goal is not to build the biggest product possible. It is to create an exceptionally meaningful personal discovery experience that people naturally want to share.

## 0.1 Launch MVP (substantially reduced)

The launch MVP contains only:

1. Completed Stage 2 voice input and transcription.
2. The adaptive interview upgraded with evidence-backed insights and user corrections.
3. Generation of three results: **North Star**, **Hidden Thread**, and **Archetype**.
4. A beautiful, mobile-first results reveal for those three results.
5. **One** shareable card: the North Star, formatted for Instagram Stories (1080 × 1920).
6. A minimal public share page with a referral link and attribution.
7. Secure saving of private results, without requiring marketing consent.

Everything else is post-launch unless it is strictly necessary for security, privacy, or reliability.

### Explicitly deferred to post-launch

- Additional share card types (Archetype, What Drives Me, Something to Know About Me, Hidden Thread cards).
- Multiple export formats (4:5 portrait, 1:1 square).
- Visual themes for cards.
- The Spark onboarding experiment.
- Payments, Stripe, the $29 Life Blueprint, and subscriptions.
- Extended action journeys (14-day experiences).
- Our Connection, Know Me Better, Our Circle, and annual recaps.
- Results screens beyond North Star, Hidden Thread, and Archetype (drivers, tensions, directions, next chapter), and the PDF. The report schema may anticipate these fields, but they are not built or shown at launch.

## 0.2 The first 10 to 15 testers are the primary validation milestone

Before expanding scope, we need to learn:

- Do people feel genuinely understood?
- Are insights accurate and grounded in their actual stories?
- Can they correct inaccurate interpretations?
- Do they voluntarily share their North Star?
- Do friends click through and complete the discovery?

Treat this feedback as exploratory, not statistically conclusive. Do not build more features simply because they appear in the roadmap.

## 0.3 Safety and privacy must be ready before any external testing

**Audience:** adults aged 18 and older. Add a clear age confirmation before the interview starts and state the age requirement in the terms and privacy information.

**Distressing disclosures.** Before inviting real testers, implement and test a defined response:

- Each interview turn checks for signals of acute distress, such as self-harm or suicidal thoughts, abuse, or immediate danger.
- When detected, the interviewer pauses the discovery flow, responds with compassion, does not probe for detail, and offers to pause, stop, or continue later.
- It provides support guidance and crisis resources relevant to the user's location only where those resources are reliable. Keep resources in a curated, maintained configuration with sources and a last-verified date, and fall back to a reputable international helpline directory when no verified local resource exists.
- Those disclosures are never turned into insights, archetypes, or share content, and never appear in analytics events.
- Test the protocol with scripted test conversations before any tester sees the product.

**Not therapy.** Do not frame or market the app as therapy, counseling, or a mental-health tool.

**Sensitive data protection before external tests:**

- Raw recordings are not stored. If temporary storage is needed for transcription, delete it automatically and verify the deletion.
- Transcripts are accessible server-side only, protected by row-level security, and never written to logs, analytics, or error messages.
- Check and document the data retention settings of the transcription and AI providers.
- Testers see a plain-language consent and privacy explanation before starting.
- Users can delete their data, and test data has a defined retention limit.

## 0.4 Free during initial validation

No Stripe integration or monetization features in the launch MVP. The $29 Life Blueprint and any subscription remain future hypotheses (see Sections 18 and 26).

## 0.5 Preserve the long-term social architecture without building it

Individual discovery comes first. The future vision includes mutually consented friend and partner discoveries, but those features are not implemented now.

Even so, results must be:

- Structured and versioned.
- User-editable, with corrections stored.
- Stored separately from user-approved public share data.

Do not create connection, permission, or joint-report tables yet. Document them for future migrations.

## 0.6 Preserve the existing project

We are currently on Stage 2 of the original implementation. Inspect the repository before making changes. Do not restart, delete existing functionality, or refactor unrelated code.

## 0.7 Documentation

In Plan Mode, audit the existing application and propose how to reconcile the original build plan with this master strategy.

After approval, update `CLAUDE.md` and the relevant supporting documentation. Mark old or superseded specifications clearly (for example: "SUPERSEDED on 2026-11-19, see docs/ROADMAP.md") so there is exactly one authoritative active roadmap. Preserve the original development history.

## 0.8 Implementation order

1. Complete and validate Stage 2, together with the safety and privacy safeguards required for testing.
2. Then the evidence engine.
3. Then the report (North Star, Hidden Thread, Archetype).
4. Then the results reveal.
5. Then the minimal sharing loop.

Do not start any future phase without approval.

## 0.9 What to present first

Before editing any files:

1. The revised minimal launch roadmap (Section 26 defines it).
2. Conflicts between this strategy and the existing implementation.
3. Decisions that need founder input.

**Then wait for approval before editing files.**

---

# 1. THE NEW PRODUCT VISION

## Product name

**MeetYourWhy**

Website: **meetyourwhy.com**

Working tagline:

**Discover what makes you, you.**

Supporting promise:

**Understand yourself. Find your direction. Let the people who matter understand you better.**

Long-term vision:

MeetYourWhy helps people discover recurring patterns in their life experiences, understand what motivates them, articulate a meaningful direction, and deepen understanding with the people they care about.

The product develops in two connected directions:

### A. Personal Discovery

People understand themselves through an adaptive AI conversation that discovers meaningful patterns in their stories.

They receive a beautiful, personalized identity experience that includes their North Star, hidden thread, core drivers, values, and possible directions.

They can share selected insights through Instagram Stories, messaging apps, and social media.

### B. Human Connection

Two people who have independently completed their discoveries can voluntarily connect their profiles.

They explore shared values, different motivations, and meaningful conversation questions.

Eventually, this expands to private groups, friendship experiences, and shared reflection.

**Product principle: First help people understand themselves. Then help them understand each other.**

We are pursuing BOTH identity-based virality and meaningful network effects.

However, launch the individual experience first. The connection features belong in a subsequent phase.

---

# 2. WHAT WE ARE NOT BUILDING

We are NOT building:

- A generic ChatGPT wrapper.
- A conventional personality quiz.
- A clone of Mark Manson's Purpose.
- A mental-health diagnosis tool.
- A social network with feeds, followers, and public profiles.
- A dating compatibility algorithm.
- An app that claims to objectively identify someone's one true destiny.
- A collection of unvalidated psychological scores.
- An engagement-maximizing chatbot that makes users dependent on the product.
- A product that forces people to invite friends or disclose personal information.

The experience must feel calm, emotionally intelligent, trustworthy, sophisticated, and deeply personal.

AI should help people discover plausible interpretations of their experiences, not assert psychological truths that cannot be established.

---

# 3. THE CORE CUSTOMER EXPERIENCE

Our main initial promise:

**"The most meaningful 15 minutes you'll spend understanding yourself."**

This is positioning to test, not a claim we have already proven.

The ideal experience has seven steps.

### Step 1 — Arrive

The landing page immediately communicates:

- What the product helps you discover.
- That the experience is personalized.
- That users can answer by voice or typing.
- Approximately how long it takes.
- What they will receive.
- How their personal information is handled.

Primary CTA: **Discover My Why**

No unnecessary signup before beginning.

### Step 2 — Begin the conversation

A warm, adaptive AI interviewer explores meaningful life stories.

The opening should feel like a thoughtful conversation, not a clinical assessment.

### Step 3 — Experience an early insight

Around questions 5–7, the AI reflects back a tentative pattern from the user's answers.

For example:

"I'm noticing that several of your happiest memories involve helping other people discover what they're capable of. Is that something you've noticed too?"

The user can respond:

- That resonates.
- Maybe / I'm not sure.
- Not quite.

The system must learn from the response.

### Step 4 — Complete the discovery

The AI continues exploring meaningful stories, motivations, contradictions, values, and possible directions.

It should not force the user to provide enough data for every personality framework.

### Step 5 — Reveal the result

The experience reveals:

1. Your North Star.
2. Your Hidden Thread.
3. Your Archetype.
4. Your Core Drivers.
5. Your Internal Tensions.
6. Your Possible Directions.
7. Your First Real-World Experiment.

The reveal must be emotionally compelling, evidence-backed, and easy to understand.

### Step 6 — Share selected insights

The user can select, edit, and approve beautiful visual cards for Instagram Stories, messaging apps, and other social channels.

Nothing is public by default.

### Step 7 — Invite deeper connection

The individual experience can suggest:

"Curious what makes someone close to you tick?"

At launch, this can simply invite a friend to complete their own discovery.

Later, it leads to a private joint reflection experience.

---

# 4. REBUILD THE INTERVIEW INTELLIGENCE AROUND REAL STORIES

The adaptive interview is our most important AI capability.

The original system uses a profile covering Ikigai, Myers-Briggs-inspired types, Big Five, Enneagram, character strengths, Schwartz values, RIASEC, and life stories.

We are simplifying the primary inference architecture.

## New primary dimensions

### 1. Life Stories

- Peak experiences.
- Childhood interests.
- Important turning points.
- Meaningful accomplishments.
- Painful frustrations where appropriate.
- Experiences of flow.
- Recurring roles across different contexts.

### 2. Core Drivers

What consistently creates motivation or energy?

Examples:

- Creating.
- Exploring.
- Helping.
- Teaching.
- Building.
- Connecting.
- Solving.
- Protecting.
- Leading.
- Understanding.

These are descriptive hypotheses, not diagnostic categories.

### 3. Personal Values

What matters deeply to the user?

Examples:

- Freedom.
- Security.
- Creativity.
- Connection.
- Growth.
- Contribution.
- Mastery.
- Independence.

Explore how those values manifest through actual decisions.

### 4. Demonstrated Strengths

What does the user's history suggest they may do well?

Base conclusions on concrete examples.

Do not automatically equate enjoyment with competence.

### 5. Internal Tensions

Identify meaningful differences between:

- Stated values and actual choices.
- Security and freedom.
- Independence and belonging.
- Ambition and contentment.
- Personal desires and external expectations.

Avoid manufacturing contradictions merely to make the report sound profound.

### 6. Possible Directions

Identify plausible directions worth exploring through real-world experiments.

These are possibilities, not predictions or prescriptions.

### 7. The Hidden Thread

This is our signature intellectual feature.

Identify possible recurring motivations across different life stages.

The strongest version connects at least three genuinely distinct memories, when available.

If the evidence is insufficient, acknowledge that and present a tentative observation rather than inventing a coherent narrative.

## Interview behavior

The interviewer should:

- Ask one question at a time.
- Follow interesting answers.
- Prefer concrete stories over abstract self-descriptions.
- Occasionally challenge assumptions respectfully.
- Ask for clarification when evidence is ambiguous.
- Notice patterns without overcommitting to them.
- Offer alternative interpretations.
- Respond naturally when users disagree.
- Adapt to the user's language and level of detail.
- Allow users to skip sensitive questions.
- Avoid making every response a coaching exercise.
- Avoid excessive praise, repetitive affirmations, and artificial enthusiasm.

An excellent interviewer is curious, perceptive, warm, and appropriately skeptical.

## Interview duration

Keep approximately 15 minutes as the target, not an inflexible requirement.

The original 12–18 question limit remains a useful starting point.

Do not force the interview to continue merely to fill every profile category.

Provide a clear progress experience without implying scientifically precise confidence measurement.

## Early mirror moments

Preserve the original concept of mirror moments around questions 5–7.

Upgrade them so users can explicitly confirm, correct, or reject the interpretation.

Store their response.

A rejection should modify the working hypothesis, not simply cause the AI to rephrase and repeat its original conclusion.

---

# 5. INTRODUCE AN EVIDENCE-BASED INSIGHT ENGINE

Every meaningful insight must have traceable supporting evidence.

Design an internal structure such as:

- `insightId`
- `category`
- `hypothesis`
- `supportingEvidence`
- `alternativeInterpretations`
- `userFeedback`
- `confidenceLabel`
- `status`

Confidence labels might be:

- Emerging.
- Supported by several examples.
- Confirmed by user.
- Disputed.
- Insufficient evidence.

Do not represent model-generated numerical confidence as a scientifically validated probability.

## Evidence verification

Each evidence reference should point to actual user statements or story identifiers.

Quoted text must match the transcript.

Use deterministic quotation verification rather than relying entirely on another LLM to check itself.

When the AI infers something, clearly distinguish the original statement from its interpretation.

Never invent childhood memories, achievements, fears, or motivations.

## Alternative interpretations

The system should consider different explanations for recurring patterns.

Example:

The user repeatedly enjoys helping colleagues.

Possible explanations:

- They enjoy teaching.
- They enjoy helping others improve.
- They enjoy mastering and communicating expertise.
- They enjoy recognition associated with being useful.

The interview should explore which interpretation fits best.

## User correction

Users must be able to say:

- That's right.
- Partly right.
- That's not me.
- Here's what I actually meant.

Corrections must be incorporated into subsequent analysis.

This becomes a foundation for future long-term personalization.

---

# 6. SIMPLIFY THE PSYCHOLOGICAL FRAMEWORKS

We are moving away from making multiple personality frameworks the primary product.

### Keep

- Narrative life-story analysis.
- Values exploration.
- Motivational patterns.
- Ikigai as an optional reflection framework.
- Possible career-interest concepts when relevant.

### Reconsider or defer

- Four-letter MBTI-inspired classifications.
- Enneagram classifications.
- Big Five trait scores inferred from a short conversation.
- VIA strength rankings inferred without appropriate assessment.
- RIASEC codes inferred without appropriate assessment.
- Human Design.

Do not make unsupported scientific or psychological claims.

A properly administered validated assessment could be introduced later as an optional module, subject to licensing, methodology, and validation.

For now, prioritize personal narratives and grounded insights.

Avoid third-party framework trademarks, proprietary test questions, copied descriptions, or misleading claims of scientific validation.

---

# 7. DESIGN THE NORTH STAR AS A HYPOTHESIS

The North Star should be:

- Brief.
- Personal.
- Memorable.
- Grounded in the user's experiences.
- Written in natural language.
- Aspirational without being generic.

Prefer fewer than 20 words where possible.

Examples of style:

"To help people see possibilities they couldn't see before."

"To create spaces where people feel free to be themselves."

"To turn complex ideas into things that genuinely improve people's lives."

These are fictional examples, not predefined outcomes.

Users must be able to:

- Edit their North Star.
- Reject it.
- Request alternatives.
- Save a preferred version.
- Revisit it later.

Never present the generated statement as the user's objectively true purpose.

---

# 8. MAKE THE HIDDEN THREAD THE SIGNATURE FEATURE

This is the most important emotional component.

The Hidden Thread visually connects meaningful moments across a person's life.

Example:

Childhood → University → Career → Underlying motivation.

The output should include:

1. Three actual stories where available.
2. Relevant user quotations.
3. The recurring theme.
4. Why the stories may be connected.
5. Another plausible interpretation if appropriate.
6. A way for the user to respond or correct it.

The reveal should feel like discovering a meaningful pattern, not receiving a generic personality description.

This section should be one of the most beautifully designed parts of the product.

Do not generate forced connections solely to create an emotional reaction.

---

# 9. CREATE A DISTINCTIVE ARCHETYPE SYSTEM

We want the sharing appeal of memorable personality types without pretending to measure fixed personality categories.

Create a flexible archetype system.

Possible examples:

- The Possibility Maker.
- The Bridge Builder.
- The Curious Explorer.
- The Thoughtful Creator.
- The Quiet Catalyst.
- The Meaning Maker.

These are illustrative names, not a finalized taxonomy.

Each archetype should have:

- A memorable name.
- A short description.
- A supporting behavioral pattern.
- Evidence from the interview.
- Clear limitations.
- User approval.

Avoid rigid typing that places everyone into a small number of stereotyped categories.

Consider a curated archetype library for consistency and social comparison, while allowing sufficiently personal descriptions.

The archetype system should be designed for expressive sharing, not pseudo-scientific assessment.

---

# 10. REDESIGN THE RESULTS EXPERIENCE

We are upgrading from a report-first experience to an interactive reveal-first experience.

The original PDF remains available, but it is no longer the center of the product.

> **LAUNCH SCOPE NOTE (Section 0):** At launch, the reveal includes only Screen 1 (North Star), Screen 2 (Hidden Thread), Screen 3 (Archetype) and a simplified Screen 8 (one North Star card). Screens 4 to 7 and the PDF are post-launch.

## Reveal sequence

### Screen 1 — Your North Star

One memorable statement.

Beautiful typography.

Minimal distraction.

Edit or confirm.

### Screen 2 — Your Hidden Thread

A visual story timeline connecting different life experiences.

This is the main emotional reveal.

### Screen 3 — Your Archetype

A memorable identity description.

Supporting evidence.

Editable wording.

### Screen 4 — What Drives You

Three to five meaningful drivers and values.

Avoid arbitrary numerical scores.

### Screen 5 — Your Tensions

Thoughtful observations about competing motivations.

No sensational psychological labeling.

### Screen 6 — Your Possible Directions

Two or three plausible opportunities or areas to explore.

Each should explain why it connects to the user's stated experiences.

### Screen 7 — Your Next Chapter

A realistic initial action or short experiment.

### Screen 8 — Share Your Discovery

A premium social card selection experience.

## PDF

Keep downloadable PDF generation, but treat it as a secondary artifact.

Provide a concise, high-quality report with supporting evidence.

Avoid unnecessarily long, repetitive psychological analysis.

Users should not need to read a lengthy PDF to experience the core value.

---

# 11. BUILD A SOCIAL IDENTITY ENGINE

This is one of the largest strategic additions.

Social sharing must be designed into the results architecture rather than added as a generic button near launch.

> **LAUNCH SCOPE NOTE (Section 0):** At launch, build only Card A (My North Star) in the Instagram Story format (1080 × 1920). Cards B to E, the portrait and square formats, and visual themes are post-launch.

## Five initial card concepts

### Card A — My North Star

Displays the approved purpose statement.

Intended for aspirational, meaningful sharing.

### Card B — My Archetype

Displays the user's chosen archetype and a short descriptor.

Designed for playful identity expression and social comparison.

### Card C — What Drives Me

Displays three personal drivers.

Simple, recognizable, and easy for friends to react to.

### Card D — Something to Know About Me

Displays one user-approved, emotionally meaningful statement.

Particularly useful for private messages or close friends.

### Card E — My Hidden Thread

Displays a safe, concise summary of the recurring pattern.

Never expose the underlying private life stories by default.

## Required card functionality

Users should be able to:

- Preview all available cards.
- Select a card.
- Edit the displayed wording.
- Choose from several curated visual themes.
- Preview story and feed layouts.
- Download a high-quality image.
- Copy a shareable link.
- Use native mobile sharing where supported.
- Explicitly approve public content.

## Visual formats

Support:

- Instagram Story: 1080 × 1920.
- Portrait feed: 1080 × 1350.
- Square: 1080 × 1080.

Ensure:

- Readable typography.
- Good contrast.
- Appropriate safe margins.
- No cropped quotes.
- Support for multiple languages.
- Proper text wrapping.
- Consistent branding.
- Attractive layouts for different text lengths.

Do not assume a website can automatically publish an Instagram Story.

Use reliable image export and supported native share mechanisms.

## Design direction

Premium editorial aesthetic.

Warm neutral colors, deep greens, muted blues, tasteful accent colors, generous whitespace, elegant typography, and subtle motion.

Avoid generic neon AI styling, excessive gradients, or gamified dashboards.

The card should feel like something someone is proud to post.

Establish a distinctive and consistent visual identity.

Every share asset should contain subtle MeetYourWhy branding and a clear discovery invitation.

---

# 12. DESIGN A PRIVACY-FIRST SHARE SYSTEM

The user must always control what becomes public.

A user completing an interview does NOT mean they consent to publishing their results.

## Core rules

- All interviews and complete reports are private by default.
- No personal result is indexed publicly without explicit consent.
- Public cards contain only approved fields.
- Private transcripts never appear in public share payloads.
- Private results must never be accessible through a public share token.
- Users can revoke public links.
- Shared cards should not contain sensitive personal stories unless explicitly selected.
- Users can preview exactly what recipients will see.
- Public card text must be sanitized and safely rendered.
- Do not include private user identifiers in public metadata.
- Do not expose user email addresses through referral links.
- Treat a screenshot as irrevocable once another person has saved it, and explain that revoking a link cannot delete downloaded copies.

Use separate internal representations for:

1. Private analysis.
2. User-approved share content.
3. Public share page.

Do not simply expose a partial view of a private database object.

---

# 13. CREATE THE VIRAL REFERRAL LOOP

Each shared identity card can lead to a public share page.

The recipient should see:

- The approved card.
- A simple explanation of MeetYourWhy.
- A clear invitation to discover their own WHY.
- A mobile-optimized start button.

Example CTA:

**Discover what makes you, you.**

A secondary CTA might be:

**Find your hidden thread.**

Do not overcomplicate the public share page.

## Attribution

Design unique, privacy-preserving share identifiers.

Track:

- Share card created.
- Share card approved.
- Download selected.
- Native share initiated.
- Public share page viewed.
- Referral CTA clicked.
- Referred interview started.
- Referred interview completed.
- Referred purchase completed, if applicable.

Do not assume that clicking a share button means a successful social post.

Screenshots and private messages will create unattributed traffic.

Support campaign and referral attribution without invasive tracking.

## Viral coefficient

Monitor the approximate number of new completed users generated by each existing completed user.

Use measured unique referrals rather than theoretical audience reach wherever possible.

Track the funnel:

Completed discovery → Share → Referral visit → Interview start → Completed discovery.

Avoid optimizing vanity metrics at the expense of real participation.

---

# 14. ADD A TWO-STEP DISCOVERY ENTRY EXPERIMENT

A 15-minute interview can be a significant commitment for someone arriving from Instagram.

We want to investigate a lightweight entry experience.

> **LAUNCH SCOPE NOTE (Section 0):** The Spark experiment is deferred to post-launch. Launch with direct full-interview entry only.

## The Spark

Approximately two to three minutes.

A small number of engaging, meaningful questions.

Generates one tentative reflection.

Invites the person to continue into the full discovery.

## The Full Discovery

Approximately 10–15 additional minutes, depending on answers.

Delivers the evidence-backed North Star, hidden thread, archetype, and full results.

This should be implemented as an experiment, not automatically assumed to outperform the existing funnel.

Architecture should support testing:

A. Direct full-interview entry.

B. Spark followed by the full interview.

Avoid building a separate complex experience before the core interview is validated.

---

# 15. DESIGN THE CONNECTION ENGINE FOR PHASE 2

This is our proposed future network-effect mechanism.

Do not fully build it during Stage 2.

However, avoid architectural decisions that would make it unnecessarily difficult later.

## Our Connection

Two people complete their own discoveries.

One sends an invitation.

The other accepts.

Both explicitly select which approved insights they wish to share.

The system produces a private shared reflection.

Potential output:

- Shared values.
- Different motivations.
- Complementary approaches.
- Interesting points of disagreement.
- Meaningful conversation questions.
- Areas where each might better understand the other.

Avoid compatibility percentages, relationship predictions, diagnoses, or claims about another person's hidden feelings.

## Connection permissions

Requirements:

- Mutual opt-in.
- Explicit field-level sharing choices.
- Ability to decline without notification pressure.
- Ability to revoke permission.
- No access to another person's full private interview.
- No sharing another person's profile onward without authorization.
- No public indexing of connections.
- Clear lifecycle for deleted and revoked data.
- Appropriate handling when users disagree with an AI-generated comparison.

## Future experiences

### Know Me Better

A user selects safe questions about their approved values or preferences.

Friends guess or respond.

The goal is meaningful conversation and playful discovery.

Do not automatically generate quizzes from private or sensitive statements.

### Our Circle

Three to six people join a private, opt-in group discovery experience.

They learn about shared values and differences through selected information.

Avoid ranking, labeling, or profiling people within groups.

### Your WHY, Together

A later feature for revisiting how people's priorities, values, and goals have evolved.

Only useful once we have meaningful longitudinal user data.

---

# 16. DEFINE THE ACTUAL NETWORK EFFECT

The network effect is NOT simply that people share cards.

We want the product to become more useful when trusted people also participate.

The proposed progression:

1. A user completes their own discovery.
2. They share an approved part of their result.
3. A friend becomes curious.
4. The friend completes their own discovery.
5. Both users can opt into a shared experience.
6. Their connection produces additional value.
7. One or both users invite others to discover themselves.

We must test whether the connected experience genuinely increases value.

Important metrics:

- Invitation acceptance.
- Invite-to-discovery completion.
- Connection opt-in.
- Joint-report completion.
- Post-connection satisfaction.
- Repeat use of shared experiences.
- Additional invitations generated.
- User-reported improvement in mutual understanding.

Do not add social features merely because they might produce invitations.

The primary individual product must remain useful without a network.

---

# 17. INTRODUCE A REAL-WORLD ACTION BRIDGE

We do not want people to finish a beautiful report and immediately forget it.

The final result should include a small, realistic experiment connected to the user's possible direction.

> **LAUNCH SCOPE NOTE (Section 0):** The action bridge, including the single next step, is post-launch. The report schema may reserve a field for it.

Example:

If the user appears energized by teaching, suggest a low-risk opportunity to test teaching or mentoring.

If they seem interested in entrepreneurship, suggest a small customer-discovery experiment.

If they value creativity, suggest producing something specific and reflecting on the experience.

## First version

One personalized next step.

No complex habit tracker.

## Later

A 14-day experience with:

- Small actions.
- Optional reminders.
- Reflection prompts.
- User feedback.
- Updated hypotheses.
- A simple end-of-journey review.

This becomes a potential premium offering.

Avoid building a full coaching subscription platform before validating demand.

---

# 18. REVISE THE MONETIZATION STRATEGY

The original plan makes the entire experience free and delays payment until later.

We are changing that into an explicit monetization experiment.

> **LAUNCH SCOPE NOTE (Section 0):** No monetization in the launch MVP. No Stripe integration. The free experience is the whole product during validation. Everything in this section is a future hypothesis.

## Free Discovery

Potentially includes:

- Full adaptive discovery interview.
- North Star.
- Hidden thread.
- Basic archetype.
- Key drivers.
- Selected share cards.
- One next action.

Do not make the free experience feel intentionally incomplete or deceptive.

## Paid Life Blueprint

Working price hypothesis: **$29 one-time**.

Test $19, $29, and $39 when appropriate.

Potential added value:

- Deeper analysis.
- Alternative interpretations.
- Additional possible directions.
- Expanded supporting evidence.
- Personalized action journey.
- Premium downloadable report.
- Follow-up reflection.

Paid functionality must genuinely add value, not simply charge for information the user has already been promised.

## Future Membership

Potential price hypothesis: approximately $12/month.

Only introduce if users demonstrate ongoing need.

Possible features:

- Evolving personal profile.
- Ongoing reflections.
- Adaptive experiments.
- Guided life reviews.
- New discovery journeys.

Do not implement subscriptions during the immediate Stage 2 work.

## Commercial metrics

Eventually measure:

- Completed discoveries.
- Offer views.
- Checkout starts.
- Purchase conversions.
- Refunds.
- Revenue per completed discovery.
- AI cost per completed discovery.
- Gross contribution margin.
- Acquisition cost.
- Repeat purchases.
- Membership retention, if introduced.

Prices are hypotheses, not validated market facts.

---

# 19. UPDATE THE EMAIL GATE

The original specification is inconsistent about when email collection happens.

We need one clear experience.

Proposed rule:

Allow users to complete the interview and receive the core results without mandatory marketing consent.

Offer optional email delivery and account creation for saving results and returning later.

If an email is needed for particular paid or persistent features, explain why at that point.

Separate:

- Essential transactional communication.
- Account-related communication.
- Optional marketing consent.

Marketing consent must not be bundled into essential product access.

Avoid surprising users with a compulsory email gate after a lengthy interview.

Review the authentication and persistence model before making this change, so saved sessions remain secure.

---

# 20. UPDATE THE TECHNICAL ARCHITECTURE

Keep the existing stack wherever practical.

Original stack:

- Next.js.
- TypeScript.
- Tailwind.
- Vercel.
- Supabase.
- OpenAI speech transcription.
- Anthropic models.
- React PDF.
- Resend.
- PostHog.

Do not migrate technologies simply because newer options exist.

Verify actual model IDs and API compatibility before implementing changes. Do not assume model names written in the original plan are valid without checking the installed SDKs and provider documentation.

## Separate major domains

Organize the system conceptually around:

1. Interview engine.
2. Evidence and profile engine.
3. Insight generation.
4. Report generation.
5. Results presentation.
6. Social-card rendering.
7. Public sharing and attribution.
8. Identity and user accounts.
9. Future connections and permissions.
10. Analytics and experimentation.
11. Billing, when introduced.

Use logical separation without introducing unnecessary microservices.

## Versioned schemas

Create or plan explicit schema versions for:

- Interviews.
- Evidence records.
- Profiles.
- Insight reports.
- Share cards.
- Public share payloads.
- Connections.
- Consent records.

Older results should not break when the report schema evolves.

Preserve migration compatibility with existing data.

## Model output validation

Use strict schemas and Zod validation.

Retry safely when model output is malformed.

Provide graceful fallback states.

Avoid repeated expensive model calls with no limits.

Validate user inputs on the server.

Do not trust client-provided profile or report data.

---

# 21. IMPROVE THE VOICE EXPERIENCE — CURRENT STAGE 2

We are currently working on voice input.

This stage should remain the immediate development priority.

Preserve existing functioning voice features.

## Required functionality

- Large, accessible microphone button.
- Reliable recording on mobile browsers.
- Visible recording status.
- Recording timer.
- Clear stop and retry controls.
- Graceful microphone-permission handling.
- Audio transcription.
- Editable transcript before submission.
- Typed-answer fallback.
- Language support for English, French, and Spanish.
- Proper handling of empty audio and network failures.
- Secure server-side API keys.
- No unnecessary retention of raw audio.

## Performance improvements

Investigate:

- Transcription latency.
- Mobile browser reliability.
- Slow-network behavior.
- Upload size.
- Recording formats.
- Retry behavior.
- Error recovery.
- Loading feedback.
- Cost per voice interaction.

The user should never wonder whether the application is listening, processing, or broken.

## Privacy

Do not store raw voice files by default.

If temporary storage is used, implement automatic deletion and verify it.

Be transparent about transcription providers and data handling.

## Test devices

At minimum:

- iPhone Safari.
- Android Chrome.
- Desktop Chrome.
- Desktop Safari where feasible.

## Stage 2 integration

The voice interface must be compatible with the revised interview engine.

Do not tightly couple recording logic to the old personality framework.

A transcribed answer should flow into the same adaptive interview pipeline as a typed answer.

Voice is an input modality, not a separate reasoning system.

**Complete and stabilize Stage 2 before implementing the social engine.**

---

# 22. IMPROVE THE DATABASE DESIGN

Inspect the current Supabase schema.

Do not destroy or rename working tables without a migration plan.

We will eventually need data structures representing:

### Users

Identity, language, consent preferences, and account status.

### Interview Sessions

Progress, status, language, timestamps, and session ownership.

### Interview Responses

Questions, answers, source type, and sequencing.

### Evidence

Supporting quotes and structured life-story references.

### Profiles

Versioned user-approved hypotheses and interpretations.

### Reports

Generated and user-corrected discovery results.

### Share Cards

Card type, visual theme, user-approved content, and status.

### Public Share Links

Opaque identifiers, visibility, revocation, and creation timestamps.

### Referral Attribution

Share source, referred session, and conversion events where lawfully and technically appropriate.

### Connections

Invitation status and two-party relationship between participating users.

### Connection Permissions

Exact approved fields, consent status, revocation, and timestamps.

### Joint Reports

Private reports based only on mutually approved data.

### Purchases

Payment provider identifiers and transaction status, when billing launches.

### Analytics and Operational Costs

Relevant events, token usage, transcription cost, report cost, and errors.

Implement only the tables needed for the current stage and near-term launch.

Document the rest for future migrations.

Apply row-level security to all relevant private tables.

Public share access must use a dedicated, restricted access path.

---

# 23. TRUST, PRIVACY, AND SAFETY ARE CORE PRODUCT FEATURES

We are processing intimate personal narratives.

Treat this as a high-trust product from day one.

## Required principles

- Data minimization.
- Clear privacy disclosures.
- User-controlled sharing.
- Appropriate legal basis for processing.
- Explicit consent where required.
- Secure storage.
- Encryption in transit.
- Appropriate encryption at rest.
- Strict server-side access controls.
- Account deletion.
- Data export.
- Retention limits.
- Deletion and consent-revocation workflows.
- Secure handling of backups and logs.
- No sensitive transcripts in analytics events.
- No API keys in public code.
- No sensitive data in error messages.
- Privacy-friendly referral attribution.

For EU-facing usage, account for GDPR requirements, including processor agreements, international transfers, access/deletion rights, and the possibility of sensitive or special-category data appearing in free-text conversations.

Review any optional use of interview data for model improvement separately; do not assume consent to use the product is consent to train models.

## Psychological safety

Do not diagnose mental-health conditions.

Do not present speculative inferences as facts.

Avoid unsupported claims about trauma, attachment patterns, unconscious motivations, or personality disorders.

Do not encourage unhealthy emotional dependency.

Allow users to skip questions and disagree.

Plan appropriate handling for distressing or crisis-related disclosures.

Do not label the app as therapy.

Set an initial supported-age policy and enforce it appropriately; do not silently assume the product is suitable for children.

> **REQUIRED BEFORE EXTERNAL TESTING (Section 0.3):** the launch audience is adults aged 18 and older, and the distressing-disclosure protocol and sensitive-data protections defined in Section 0.3 must be implemented and tested before any real tester uses the product.

---

# 24. DEFINE THE ANALYTICS FUNNEL PROPERLY

Use PostHog or the current analytics implementation, keeping private content out of event properties.

## Discovery funnel

- `landing_view`
- `discovery_start`
- `question_answered`
- `mirror_moment_shown`
- `mirror_feedback_submitted`
- `interview_complete`
- `report_generated`
- `report_viewed`
- `insight_corrected`

## Sharing funnel

- `share_options_viewed`
- `share_card_selected`
- `share_card_edited`
- `share_card_approved`
- `share_image_downloaded`
- `native_share_initiated`
- `public_share_viewed`
- `referral_cta_clicked`
- `referred_discovery_started`
- `referred_discovery_completed`

## Future connection funnel

- `connection_invite_created`
- `connection_invite_accepted`
- `connection_permissions_approved`
- `joint_report_generated`
- `joint_report_viewed`
- `connection_feedback_submitted`

## Future monetization funnel

- `paid_offer_viewed`
- `checkout_started`
- `purchase_completed`
- `refund_processed`

Avoid tracking sensitive response text or private psychological interpretations.

Use anonymous or pseudonymous identifiers where practical.

Document analytics naming conventions and event properties.

---

# 25. DEFINE MEANINGFUL SUCCESS METRICS

We need to measure whether the product is genuinely good, not just visually impressive.

## Insight quality

Evaluate:

- Specificity.
- Faithfulness to supporting evidence.
- Emotional resonance.
- User-confirmed accuracy.
- Alternative-interpretation quality.
- Usefulness.
- Frequency of incorrect or rejected insights.

## Interview

Track:

- Start rate.
- Completion rate.
- Median completion time.
- Drop-off by question.
- Voice versus typed completion.
- Transcription errors.
- Retry frequency.
- User satisfaction.

## Sharing

Track:

- Percentage selecting a card.
- Percentage exporting or sharing.
- Relative popularity of each card type.
- Referral visits.
- Referred interview starts.
- Referred completions.
- Effective referral conversion.

## Connection

Later track:

- Invitation acceptance.
- Joint experience completion.
- Mutual satisfaction.
- Repeat participation.
- Additional invitations.
- Perceived improvement in mutual understanding.

## Business

Track:

- Cost per completed discovery.
- Payment conversion.
- Contribution margin.
- Refund rate.
- Acquisition cost when applicable.
- Return usage.

## Initial validation

Before broad launch, conduct qualitative tests with people outside the immediate development process.

Start with approximately 10–15 testers, then expand to a larger cohort.

The initial group is for finding problems, not proving statistical significance.

Our aspirational early goals include:

- Strong interview completion.
- Most testers identifying a specific, evidence-backed insight.
- Clear evidence that users feel understood.
- Voluntary sharing.
- At least some measurable referred completions.
- Users expressing interest in sharing the experience with someone close to them.

Do not claim product-market fit from compliments or a small friendly test.

---

# 26. REDESIGN THE DEVELOPMENT ROADMAP

Do not erase the original stage history.

Document the completed and ongoing original stages, then create a revised forward-looking roadmap.

## Existing Stage 0 — Setup and Specification

Status: inspect and verify.

Preserve existing setup, Git configuration, deployment, and credentials.

Update product documentation only as necessary.

## Existing Stage 1 — Landing Page and Adaptive Interview

Status: inspect and verify.

Identify necessary improvements:

- New profile dimensions.
- Evidence records.
- User-feedback loop.
- Hidden-thread quality.
- Removal or de-emphasis of excessive personality scoring.
- Updated product copy.

Do not rewrite functioning code immediately.

Create a retrofit list and prioritize only changes necessary for the next stages.

## Existing Stage 2 — Voice Input

**CURRENT STAGE. COMPLETE THIS FIRST.**

Finish voice recording, transcription, fallback input, language support, privacy, error handling, and mobile testing.

Make minimal architectural improvements needed to keep compatibility with the revised interview engine.

### Stage 2 acceptance criteria

- Reliable voice input.
- Correct editable transcription.
- Working typed fallback.
- Appropriate multilingual handling.
- No exposed API secrets.
- Safe raw-audio handling.
- Tested mobile behavior.
- No regression in the adaptive interview.

## ACTIVE LAUNCH ROADMAP (authoritative, per Section 0)

The original Stages 3 to 7 from the November 19, 2026 build plan are superseded by the stages below. Keep them in the project history, marked as superseded.

## Stage 2B — Safety and Privacy Baseline (required before external testing)

Build:

- 18+ age confirmation before the interview.
- Distressing-disclosure detection and response protocol (Section 0.3).
- Curated crisis-resource configuration with sources and last-verified dates.
- Verified deletion of raw audio.
- Server-only transcript access with row-level security.
- No transcripts or sensitive content in logs, analytics, or error messages.
- Plain-language consent and privacy page.
- Data deletion for a user's own records.

### Done when

- Scripted distress conversations trigger the correct compassionate response, offer pause or stop, and show appropriate resources.
- Raw audio is confirmed deleted after transcription.
- An unauthenticated or different user cannot read another user's transcript.
- A search of logs and analytics events finds no transcript text.

## Stage 3 — Interview Intelligence and Evidence Engine

Build:

- Revised profile schema built around life stories, drivers, values, demonstrated strengths, and tensions (versioned).
- Evidence records that point to exact user statements, with deterministic quote verification.
- Hypothesis generation with alternative interpretations.
- Mirror moments with explicit feedback: "That resonates", "Maybe", "Not quite", and "Here's what I actually meant".
- Rejected or corrected hypotheses are revised, not rephrased.
- Improved stopping logic (about 15 minutes, 12 to 18 questions as a guide).
- Saved test transcripts and automated evaluation scripts, including sparse, contradictory, and ambiguous interviews.

### Done when

- Different users receive genuinely different follow-up questions.
- Every insight links to real user statements.
- Rejected hypotheses change the working profile.
- The system never fabricates quotes or life stories.

## Stage 4 — Discovery Report (launch scope)

Generate, from the evidence engine:

- North Star (editable, rejectable, with alternatives on request).
- Hidden Thread (up to three real stories with quotes, the recurring theme, why they may connect, an alternative interpretation where appropriate, and a way to respond).
- Archetype (name, short description, behavioral pattern, evidence, limitations, user approval).

The report schema is versioned and may include placeholder fields for drivers, tensions, and directions, but those are not generated for display at launch.

### Done when

- Results are specific, concise, and accurately grounded across at least five substantially different test transcripts.
- Sparse interviews produce honest, tentative results rather than invented narratives.

## Stage 5 — Results Reveal (launch scope)

Build mobile-first reveal screens for:

1. North Star.
2. Hidden Thread (the signature visual moment).
3. Archetype.
4. Share step (leads to Stage 6).

Each screen supports confirming, editing, or correcting what it shows.

### Done when

- The reveal works beautifully on iPhone Safari and Android Chrome.
- Users understand their results without any PDF.
- Corrections are saved.
- No private details appear in URLs or page metadata.

## Stage 6 — Minimal Sharing Loop

Build:

- One North Star card at 1080 × 1920 (Instagram Story), generated from user-approved text only.
- Explicit user approval before anything becomes public.
- Image download and native mobile sharing where supported.
- A minimal public share page: approved card, one-line explanation of MeetYourWhy, and a "Discover what makes you, you" start button.
- Opaque, revocable public share tokens stored separately from private results.
- Referral attribution through privacy-preserving share identifiers.
- Events: share_card_approved, share_image_downloaded, native_share_initiated, public_share_viewed, referral_cta_clicked, referred_discovery_started, referred_discovery_completed.

### Done when

- The card is readable and attractive for short and long North Star statements in English, French, and Spanish.
- The public page exposes no private data.
- Revoking a link makes the public page unavailable.
- A referred completion can be traced end to end.

## Stage 7 — Saved Results, Funnel Analytics, and Guardrails

Build:

- Secure saving of private results, with optional email or account for returning later. No marketing consent is required, and optional marketing consent is collected separately.
- Core discovery funnel events (Section 24, discovery and sharing funnels only), with no private content in event properties.
- Cost tracking per interview, rate limits, bot protection, retry limits, and a daily budget cap.

### Done when

- Users can safely return to saved results.
- The full discovery and sharing funnel is visible in analytics.
- Cost per completed discovery is known.

## Stage 8 — Tester Round (primary validation milestone)

- Run the full experience with 10 to 15 people outside the development process.
- Collect: did they feel understood, which line made them think "how did it know that?", were insights accurate, could they correct mistakes, did they share without being asked, and did friends click through and complete.
- Fix the most important problems found.

### Done when

- We have honest, exploratory answers to the five questions in Section 0.2.
- The founder decides, based on those answers, whether to expand testing, iterate, or change direction.

**Nothing below this line is built without explicit approval after Stage 8.**

## POST-LAUNCH BACKLOG (prioritize by demonstrated demand)

Each item requires founder approval and evidence from testing before work begins.

- Additional results screens: drivers and values, tensions, possible directions, first real-world experiment.
- Concise PDF export.
- Additional share cards (Archetype, What Drives Me, Something to Know About Me, Hidden Thread).
- Additional formats (1080 × 1350, 1080 × 1080) and visual themes.
- The Spark entry experiment (Section 14).
- Monetization experiments: the $29 Life Blueprint, price tests, refunds (Section 18).
- Extended action journeys (Section 17).
- Our Connection (Section 15), including connection permissions and joint reports.
- Know Me Better, Our Circle, annual recaps (Sections 15 and 16).
- Subscriptions, only with evidence of recurring value.

The original long-form descriptions of these stages remain in Sections 10 to 18 for reference.

---

# 27. OPTIMIZE PERFORMANCE AND OPERATING COST

We are building a potentially share-driven consumer product.

A successful social campaign should not create an uncontrolled API bill.

## Requirements

- Token-cost tracking.
- Transcription-cost tracking.
- Model-cost tracking per interview.
- Reasonable usage limits.
- Server-side rate limiting.
- Bot prevention.
- Retry limits.
- Request timeouts.
- Graceful degradation.
- Caching where safe.
- Idempotent report generation.
- Monitoring for runaway costs.
- Budget alerts.
- Environment-specific limits.

Do not repeatedly transmit unnecessary full transcripts if a safe, reliable compact representation is sufficient, but preserve access to source evidence.

Investigate whether some analysis can run asynchronously within the request lifecycle or through a durable job system without creating duplicate calls.

Do not sacrifice result quality merely to minimize tokens.

User-visible feedback should clearly indicate when analysis is in progress.

---

# 28. MAKE THE PRODUCT ACCESSIBLE AND MULTILINGUAL

Original languages:

- English.
- French.
- Spanish.

Preserve these targets.

Design localization properly rather than hardcoding English strings.

Requirements:

- Interview in the user's preferred language.
- Results in that language.
- Share cards in that language.
- Appropriate typography for varying text lengths.
- Accessible controls.
- Clear focus indicators.
- Keyboard navigation.
- Screen-reader labels.
- Reduced-motion support.
- Adequate contrast.
- Responsive mobile design.

Avoid assuming the user speaks English because of browser settings.

Ensure voice transcription errors can be corrected before being interpreted.

---

# 29. IMPROVE THE DEVELOPMENT WORKFLOW

This project is being built with Claude Code by a founder who is not a professional software developer.

Your instructions must be actionable and understandable.

## Required workflow

For each stage:

1. Explain the objective.
2. Identify files to create or change.
3. Explain important architectural choices.
4. Implement only the agreed scope.
5. Run relevant tests.
6. Explain how to manually test the feature.
7. Show what success looks like.
8. Update documentation.
9. Suggest an appropriate Git commit.

Keep work in small, reversible stages.

Do not make speculative broad refactors.

Do not introduce unnecessary infrastructure.

Do not overwrite secrets.

Do not deploy unreviewed destructive changes.

Before any database migration, inspect existing data and explain migration/rollback implications.

Keep `CLAUDE.md` updated as the authoritative project memory.

Create supporting documentation when the scope is too detailed for the main file.

Recommended structure, adapting to the repository:

- `CLAUDE.md` — vision, architecture, current state, non-negotiable rules, and roadmap.
- `docs/PRODUCT_SPEC.md` — full product behavior.
- `docs/SOCIAL_GROWTH.md` — sharing, referrals, and connection mechanics.
- `docs/ARCHITECTURE.md` — schemas, AI pipeline, privacy boundaries.
- `docs/ROADMAP.md` — implementation stages and acceptance criteria.
- `docs/DECISIONS.md` — significant product and technical decisions.
- `docs/TEST_PLAN.md` — quality assurance and validation.

Do not create duplicate documents unnecessarily if equivalent files already exist.

Use concise references from `CLAUDE.md` to supporting documents.

---

# 30. IMPORTANT PRODUCT TRADE-OFFS

When making decisions, apply these priorities in order:

1. User trust and privacy.
2. Accuracy and evidence quality.
3. Meaningful personal value.
4. Reliability.
5. Emotional quality of the experience.
6. Ease of use.
7. Natural sharing and growth.
8. Performance and cost efficiency.
9. Additional features.

Do not manufacture emotional revelations to increase sharing.

Do not sacrifice personal privacy for viral growth.

Do not make unsupported psychological claims merely because they sound compelling.

Do not overengineer future network features before the individual experience works.

Do not prioritize beautiful animations over interview quality.

Do not add a subscription without evidence of recurring value.

---

# 31. REVISE THE ORIGINAL PLAN RATHER THAN IGNORING IT

The original plan includes important features and decisions that remain useful:

- Next.js, Vercel, and Supabase.
- Adaptive interview with three anchor questions.
- Voice input and typed fallback.
- English/French/Spanish support.
- Mirror moments.
- Hidden-thread discovery.
- Evidence-backed reporting.
- PDF generation.
- Resend integration.
- PostHog analytics.
- Cost guardrails.
- Staged Claude Code development.
- Real-user testing before launch.

Retain these wherever compatible.

Explicitly identify which requirements are:

- Retained.
- Modified.
- Replaced.
- Deferred.
- Removed.

The most significant changes are:

- Framework-heavy profiling becomes narrative/evidence-based discovery.
- The report becomes an interactive results experience.
- Social sharing moves from a small late-stage feature to a core launch pillar.
- The public-share architecture becomes privacy-first.
- Referral conversion becomes a primary growth metric.
- Friend/partner experiences become a planned second product pillar.
- Monetization becomes an explicit experiment.
- The original email gate is reconsidered.
- User correction becomes a core feature.
- Long-term action journeys become a future expansion.

Do not silently discard original requirements.

---

# 32. WHAT I WANT YOU TO DO RIGHT NOW

We are not asking you to implement the entire vision today.

Start by auditing the existing repository and current Stage 2 work.

Then:

### Task A — Audit

Report:

- Existing project structure.
- Current `CLAUDE.md` specification.
- Completed original stages.
- Current Stage 2 implementation status.
- Existing database schema.
- Existing AI integrations.
- Current report/profile schemas, if any.
- Existing tests.
- Areas that conflict with the new vision.
- Technical debt or security risks relevant to this update.

### Task B — Impact assessment

Create a clear table with:

- Existing component.
- Keep, modify, replace, or defer.
- Reason.
- Urgency.
- Estimated complexity.
- Dependencies.
- Whether it blocks Stage 2.

Do not present speculative problems as confirmed issues.

### Task C — Revised architecture

Propose the minimal architectural changes required to support:

- Evidence-grounded insights.
- Editable reports.
- User-approved share cards.
- Public share pages.
- Referral attribution.
- Later two-user connections.

Distinguish what must be built now from what merely needs to be anticipated.

### Task D — Update project documentation

After presenting the plan for review, update `CLAUDE.md` and the appropriate supporting documentation.

Preserve the original build history.

Clearly identify:

**Current stage: Stage 2 — Voice Input.**

**Next priority: Complete Stage 2, then upgrade the Interview Intelligence and Evidence Engine.**

### Task E — Stage 2 completion plan

Provide an exact list of remaining Stage 2 tasks.

Identify any improvements needed for the new product direction.

Explain how to verify successful completion.

### Task F — Revised roadmap

Provide the final stage sequence, dependencies, milestones, acceptance criteria, and a realistic separation between:

- MVP essentials.
- Launch essentials.
- Post-launch experiments.
- Future network features.

Prioritize a focused launch, not the most feature-rich possible product.

### Task G — Decisions requiring founder input

Ask only about genuinely consequential unresolved choices.

Make reasonable recommendations for smaller technical decisions.

Do not block the plan on trivial preferences.

> **SCOPE FOR THIS SESSION (Section 0):** For Task F, use the Active Launch Roadmap in Section 26 as the starting point. Present the revised minimal launch roadmap, the conflicts with the existing implementation, and the founder decisions. Then wait for approval before editing any files.

---

# FINAL INSTRUCTION

Think like a founder building a remarkable, sustainable consumer product.

The ultimate ambition is:

**MeetYourWhy becomes the most compelling way to discover what makes you who you are—and a meaningful way to understand the people who matter to you.**

We want the emotional self-expression and sharing dynamics of Spotify Wrapped, combined with thoughtful AI personalization and genuinely useful private human-connection experiences.

But we are not copying Spotify's interface or pretending that self-discovery is a scientifically precise ranking exercise.

We must earn users' trust.

**The individual discovery must be worth completing even if nobody shares it.**

**The result must be worth sharing even if nobody clicks.**

**The connection experience must provide additional value when another person joins.**

That's the product strategy.

**Begin with the audit and revised plan. Do not rewrite the application or start implementing later-stage features yet.**
