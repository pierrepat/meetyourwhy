import { Profile, ConfidenceLevel } from "./profile";

export interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
}

export interface EngineResponse {
  question: string;
  profile: Profile;
  strategy: string;
  shouldEnd: boolean;
  isMirrorMoment: boolean;
}

export function buildSystemPrompt(
  profile: Profile,
  questionCount: number,
  elapsedMs: number
): string {
  const minutesElapsed = Math.round(elapsedMs / 60000);
  const phase = getPhaseDirective(questionCount, minutesElapsed, profile);

  return `You are having a meaningful, one-on-one conversation with someone to help them discover what makes them who they are. You are warm, perceptive, and genuinely curious. You speak like the wisest friend they've ever had — someone who listens deeply and notices things they don't see in themselves.

You are NOT an interviewer, therapist, or personality test. You are a conversation partner exploring someone's life stories to find the patterns that make them unique.

## How you work

After each response from the person, you do three things:
1. NOTICE what matters — extract the stories, emotions, values, and motivations in what they shared
2. UPDATE your understanding — refine your hypotheses about what drives this person
3. RESPOND naturally — ask the next question that follows the conversation, not a checklist

## What you're building (hidden from the person)

You are gradually constructing an understanding of:
- **Life Stories**: Peak moments, turning points, flow states, childhood interests, recurring roles
- **Core Drivers**: What consistently creates motivation (creating, exploring, helping, teaching, building, connecting, solving)
- **Personal Values**: What matters deeply, revealed through actual decisions they've made
- **Demonstrated Strengths**: Based on concrete examples, not self-assessment
- **Internal Tensions**: Meaningful contradictions between what they say they value and what they actually choose
- **Hidden Thread**: A recurring motivation that connects different life stages — this is the signature insight

## Current understanding
${JSON.stringify(profile, null, 2)}

## Evidence rules
- Every insight MUST be traceable to something the person actually said
- Use their exact words as quotes when possible
- Never invent or assume stories, emotions, or motivations
- Track alternative interpretations — the first hypothesis isn't always right
- Confidence levels: "insufficient" → "emerging" → "supported" → "confirmed" (or "disputed" if contradicted)

${phase}

## Response format
Respond with ONLY valid JSON (no markdown, no code fences):
{
  "question": "Your next response to the person — conversational, warm, 1-3 sentences. If this is a mirror moment, start with your reflection of the pattern, then ask if it resonates.",
  "strategy": "explore" | "go_deeper" | "mirror" | "probe_tension" | "synthesize",
  "isMirrorMoment": false,
  "profileUpdates": {
    "newStories": [
      {
        "summary": "Brief description of the story",
        "emotions": ["emotion1", "emotion2"],
        "quote": "Their exact words or close paraphrase",
        "context": "What question prompted this",
        "relatedDrivers": ["driver1"]
      }
    ],
    "drivers": [
      { "label": "creating", "description": "Why this seems to drive them", "quote": "supporting quote", "confidence": "emerging" }
    ],
    "values": [
      { "label": "freedom", "description": "How this value showed up", "quote": "supporting quote", "confidence": "emerging" }
    ],
    "strengths": [
      { "label": "pattern recognition", "description": "How they demonstrated this", "quote": "supporting quote", "confidence": "emerging" }
    ],
    "tensions": [
      { "label": "stability vs adventure", "sideA": "They value security", "sideB": "But keep choosing the unknown", "quote": "supporting quote" }
    ],
    "hiddenThread": {
      "theme": "connecting disparate things",
      "hypothesis": "They are consistently drawn to bridging gaps between different worlds",
      "alternativeHypothesis": "Or they simply enjoy novelty and variety",
      "storyIndices": [0, 2],
      "confidence": "emerging"
    }
  },
  "shouldEnd": false
}

Include only the profileUpdates fields that have new information. Omit empty arrays. Set shouldEnd to true when you feel you have a rich, evidence-backed understanding (typically 12-15 questions, but don't force it).`;
}

function getPhaseDirective(
  questionCount: number,
  minutesElapsed: number,
  profile: Profile
): string {
  if (questionCount <= 4) {
    return `## Current phase: EXPLORE (question ${questionCount + 1})
Cast a wide net. Ask about peak experiences, childhood interests, meaningful decisions, or what makes them lose track of time. Each question should explore a different life area. Listen for recurring themes even this early.

Good questions sound like:
- "Tell me about a time when you felt completely in your element..."
- "What's something you used to love doing as a kid that still shows up in your life?"
- "Think of a decision you made that surprised the people around you — what was behind it?"`;
  }

  if (questionCount <= 7) {
    const hasEnoughStories = profile.lifeStories.length >= 3;
    const hasEmergingDrivers = profile.coreDrivers.some(
      (d) => d.confidence !== "insufficient"
    );

    if (hasEnoughStories && hasEmergingDrivers) {
      return `## Current phase: MIRROR MOMENT (question ${questionCount + 1})
You've heard enough stories to notice a pattern. It's time to reflect it back.

Set "isMirrorMoment" to true and "strategy" to "mirror".

Start your response with a tentative observation about a pattern you see — something like:
"Something I'm noticing across what you've shared... [pattern]. Does that resonate with you, or am I reading it wrong?"

Be specific — reference their actual stories. Be tentative — present it as something you're wondering, not a diagnosis. Be genuine — only reflect patterns you actually see in the evidence.

The person will respond with confirmation, correction, or rejection. All three are valuable — a correction is often more revealing than a confirmation.`;
    }

    return `## Current phase: DEEPENING (question ${questionCount + 1})
You haven't gathered enough stories yet for a mirror moment. Keep exploring, but start going deeper on threads that seem rich. Ask follow-up questions that connect what they've shared so far.`;
  }

  if (questionCount <= 12) {
    const confirmedMirrors = profile.mirrorMoments.filter(
      (m) => m.response === "confirmed"
    );
    const tensions = profile.internalTensions;

    return `## Current phase: GO DEEPER (question ${questionCount + 1})
${confirmedMirrors.length > 0 ? `The person confirmed these patterns: ${confirmedMirrors.map((m) => m.reflection).join("; ")}. Build on this — explore how these patterns show up in other areas of their life.` : "No patterns confirmed yet. Keep exploring and try another mirror moment if you see a clear pattern."}
${tensions.length > 0 ? `You've noticed these tensions: ${tensions.map((t) => t.label).join(", ")}. Gently explore one — not to resolve it, but to understand what it means to them.` : "Look for contradictions between what they say matters and what they actually do. These tensions are often the most revealing insights."}

Start connecting threads across their stories. What motivations keep appearing? What role do they keep playing?`;
  }

  const isNearEnd = minutesElapsed >= 14 || questionCount >= 14;

  return `## Current phase: SYNTHESIZE (question ${questionCount + 1})
${isNearEnd ? "This should be your final question. " : ""}The conversation is winding down. Ask a question that ties together what you've learned — perhaps about their future direction, or what they'd want others to understand about them. Fill any critical gaps, but don't force it.

If you have a strong hidden thread hypothesis with multiple confirmed stories, set shouldEnd to true after this question.`;
}

export function applyProfileUpdates(
  profile: Profile,
  updates: {
    newStories?: {
      summary: string;
      emotions: string[];
      quote: string;
      context: string;
      relatedDrivers: string[];
    }[];
    drivers?: {
      label: string;
      description: string;
      quote: string;
      confidence: ConfidenceLevel;
    }[];
    values?: {
      label: string;
      description: string;
      quote: string;
      confidence: ConfidenceLevel;
    }[];
    strengths?: {
      label: string;
      description: string;
      quote: string;
      confidence: ConfidenceLevel;
    }[];
    tensions?: {
      label: string;
      sideA: string;
      sideB: string;
      quote: string;
    }[];
    hiddenThread?: {
      theme: string;
      hypothesis: string;
      alternativeHypothesis: string;
      storyIndices: number[];
      confidence: ConfidenceLevel;
    };
  },
  questionCount: number
): Profile {
  const updated: Profile = JSON.parse(JSON.stringify(profile));

  if (updates.newStories) {
    for (const story of updates.newStories) {
      updated.lifeStories.push({
        summary: story.summary,
        emotions: story.emotions,
        evidence: {
          quote: story.quote,
          context: story.context,
          questionNumber: questionCount,
        },
        relatedDrivers: story.relatedDrivers,
      });
    }
  }

  if (updates.drivers) {
    for (const driver of updates.drivers) {
      const existing = updated.coreDrivers.find(
        (d) => d.label.toLowerCase() === driver.label.toLowerCase()
      );
      const evidence = {
        quote: driver.quote,
        context: driver.description,
        questionNumber: questionCount,
      };
      if (existing) {
        existing.evidence.push(evidence);
        existing.confidence = upgradeConfidence(
          existing.confidence,
          driver.confidence
        );
      } else {
        updated.coreDrivers.push({
          label: driver.label,
          description: driver.description,
          evidence: [evidence],
          confidence: driver.confidence,
        });
      }
    }
  }

  if (updates.values) {
    for (const value of updates.values) {
      const existing = updated.personalValues.find(
        (v) => v.label.toLowerCase() === value.label.toLowerCase()
      );
      const evidence = {
        quote: value.quote,
        context: value.description,
        questionNumber: questionCount,
      };
      if (existing) {
        existing.evidence.push(evidence);
        existing.confidence = upgradeConfidence(
          existing.confidence,
          value.confidence
        );
      } else {
        updated.personalValues.push({
          label: value.label,
          description: value.description,
          evidence: [evidence],
          confidence: value.confidence,
        });
      }
    }
  }

  if (updates.strengths) {
    for (const strength of updates.strengths) {
      const existing = updated.demonstratedStrengths.find(
        (s) => s.label.toLowerCase() === strength.label.toLowerCase()
      );
      const evidence = {
        quote: strength.quote,
        context: strength.description,
        questionNumber: questionCount,
      };
      if (existing) {
        existing.evidence.push(evidence);
        existing.confidence = upgradeConfidence(
          existing.confidence,
          strength.confidence
        );
      } else {
        updated.demonstratedStrengths.push({
          label: strength.label,
          description: strength.description,
          evidence: [evidence],
          confidence: strength.confidence,
        });
      }
    }
  }

  if (updates.tensions) {
    for (const tension of updates.tensions) {
      const existing = updated.internalTensions.find(
        (t) => t.label.toLowerCase() === tension.label.toLowerCase()
      );
      const evidence = {
        quote: tension.quote,
        context: `${tension.sideA} vs ${tension.sideB}`,
        questionNumber: questionCount,
      };
      if (existing) {
        existing.evidence.push(evidence);
      } else {
        updated.internalTensions.push({
          label: tension.label,
          sideA: tension.sideA,
          sideB: tension.sideB,
          evidence: [evidence],
        });
      }
    }
  }

  if (updates.hiddenThread) {
    updated.hiddenThread = {
      theme: updates.hiddenThread.theme,
      storyIndices: updates.hiddenThread.storyIndices,
      hypothesis: updates.hiddenThread.hypothesis,
      alternativeHypothesis: updates.hiddenThread.alternativeHypothesis,
      confidence: updates.hiddenThread.confidence,
    };
  }

  return updated;
}

function upgradeConfidence(
  current: ConfidenceLevel,
  incoming: ConfidenceLevel
): ConfidenceLevel {
  const rank: Record<ConfidenceLevel, number> = {
    insufficient: 0,
    emerging: 1,
    supported: 2,
    confirmed: 3,
    disputed: -1,
  };

  if (incoming === "disputed") return "disputed";
  return rank[incoming] > rank[current] ? incoming : current;
}

export const OPENING_QUESTIONS = [
  "Think about a moment in your life when everything just clicked — when you felt completely alive and in your element. What were you doing?",
  "If you had a full year with no obligations and unlimited resources, how would you spend your time?",
  "What's something you care about so deeply that you'd work on it even if nobody noticed?",
];

export function getOpeningQuestion(): string {
  return OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
}
