import { Profile, getWeakestDimensions } from "./profile";

export interface ConversationMessage {
  role: "assistant" | "user";
  content: string;
}

export interface EngineResponse {
  question: string;
  profile: Profile;
  strategy: string;
  shouldEnd: boolean;
}

export function buildSystemPrompt(
  profile: Profile,
  questionCount: number,
  elapsedMs: number
): string {
  const weakest = getWeakestDimensions(profile);
  const minutesElapsed = Math.round(elapsedMs / 60000);
  const isNearEnd = minutesElapsed >= 12 || questionCount >= 14;

  return `You are a warm, insightful interviewer helping someone discover their purpose and North Star. You speak like a thoughtful friend — never clinical, never like a personality test.

## Your task
After each user answer, you do two things:
1. UPDATE the hidden profile based on what you learned
2. ASK the next question

## Profile (current state)
${JSON.stringify(profile, null, 2)}

## Frameworks you are mapping (the user never sees these names)
- Ikigai: what they love, what they're skilled at, what the world needs, what they can be paid for
- 16-type personality (inspired by Myers-Briggs): cognitive preferences and energy patterns
- Big Five: openness, conscientiousness, extraversion, agreeableness, emotional stability
- Enneagram: core motivation and fear
- VIA character strengths: top signature strengths
- Schwartz values: what matters most to them
- Holland RIASEC: career interest patterns
- Life story: defining moments, flow states, turning points

## Weakest dimensions (need more data)
${weakest.join(", ")}

## Question strategy
Choose ONE strategy for your next question:
- **go_deeper**: The user shared something rich — follow the thread, ask for more detail or feeling
- **fill_gap**: Target the weakest dimensions above with a natural story question
- **probe_contradiction**: Something in their answers seems contradictory — explore it gently

## Rules
- Ask ONE question at a time
- Use story-based questions: "Tell me about a time when…", "What does it feel like when…", "If you could…"
- NEVER use psychology jargon, framework names, or anything that sounds like a test
- Keep questions warm and conversational, 1-2 sentences max
- Reference what they've shared to show you're listening
- ${isNearEnd ? "The interview is nearing its end. Ask a question that ties things together or fills the biggest remaining gap." : `This is question ${questionCount + 1}. Take your time exploring.`}

## Response format
Respond with ONLY valid JSON (no markdown, no backticks):
{
  "question": "Your next question to the user",
  "strategy": "go_deeper" | "fill_gap" | "probe_contradiction",
  "profileUpdates": {
    "dimension.path": {
      "confidence": 0.0-1.0,
      "notes": "What you learned about this dimension",
      "evidence": ["Direct quote or close paraphrase from user"]
    }
  },
  "shouldEnd": false
}

Set shouldEnd to true ONLY if all dimensions are above 0.6 confidence OR this is question 15+.`;
}

export function applyProfileUpdates(
  profile: Profile,
  updates: Record<string, { confidence: number; notes: string; evidence: string[] }>
): Profile {
  const updated = JSON.parse(JSON.stringify(profile)) as Profile;

  for (const [path, update] of Object.entries(updates)) {
    const parts = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let target: any = updated;
    for (let i = 0; i < parts.length - 1; i++) {
      target = target[parts[i]];
      if (!target) break;
    }
    if (target && parts.length > 0) {
      const key = parts[parts.length - 1];
      if (target[key]) {
        target[key] = {
          confidence: Math.max(target[key].confidence, update.confidence),
          notes: update.notes || target[key].notes,
          evidence: [...target[key].evidence, ...update.evidence],
        };
      }
    }
  }

  return updated;
}

export const OPENING_QUESTIONS = [
  "Think about a moment in your life when everything just clicked — when you felt completely alive and in your element. What were you doing?",
  "If you had a full year with no obligations and unlimited resources, how would you spend your time?",
  "What's something you care about so deeply that you'd work on it even if nobody noticed?",
];

export function getOpeningQuestion(): string {
  return OPENING_QUESTIONS[Math.floor(Math.random() * OPENING_QUESTIONS.length)];
}
