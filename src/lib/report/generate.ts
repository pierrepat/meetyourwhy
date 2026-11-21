import { Profile } from "@/lib/interview/profile";
import { DiscoveryReport } from "./schema";

export function buildReportPrompt(profile: Profile): string {
  return `You are the report writer for meetyourwhy. You have just finished a deep conversation with someone and collected detailed notes about who they are. Now you will synthesize everything into three personal discoveries.

## Your source material
${JSON.stringify(profile, null, 2)}

## What you produce

### 1. North Star
A brief, personal, memorable purpose statement — under 20 words. This is their direction, not a job title.

The North Star comes from where their Ikigai circles overlap — especially where what they love meets what they're good at and what matters to them. Look at the overlaps array and the strongest entries across circles.

Write the statement in second person ("You...") or as a standalone phrase they'd say about themselves. Make it specific to their stories, not generic.

Also provide exactly 2 alternative phrasings — different angles on the same truth, so they can pick the one that feels most right.

### 2. Hidden Thread
The emotional centerpiece. Connect up to 3 of their real stories to reveal a recurring motivation they may not have seen.

The Hidden Thread comes from the core drive — the underlying motive that connects stories that look unrelated on the surface.

For each story:
- Use an exact quote from the interview (from the profile's evidence)
- Summarize the story briefly
- Explain how it connects to the thread

Then write:
- A theme statement (one sentence naming the thread)
- An explanation of why these stories connect (2-3 sentences)
- An alternative interpretation — a different but plausible reading of the same evidence

The alternative interpretation is important — it shows intellectual honesty and gives them something to push back on.

### 3. Archetype
A memorable two-or-three-word identity label that captures their core pattern. Think: "The Possibility Maker", "The Bridge Builder", "The Quiet Engineer", "The Pattern Finder".

The Archetype comes from:
- Their natural role (if identified)
- Their personality tendencies (how they orient to the world)
- Their behavioral patterns across stories

Provide:
- The name (2-3 words, "The [Something]")
- A description (2-3 sentences explaining what this archetype means for them specifically)
- A behavioral pattern (how this shows up in their daily life — specific, based on their stories)
- Evidence (2-3 exact quotes from the interview that show this pattern)
- Limitations (1-2 sentences about the potential blind spots of this pattern — not criticism, but honest reflection)

## Rules
- ONLY use quotes and stories that exist in the profile. Never invent, embellish, or paraphrase quotes.
- Write in a warm, direct, personal tone. This person should feel seen, not analyzed.
- No framework names, no jargon, no personality type codes.
- No flattery. No "You're amazing." Be specific and grounded.
- If the profile has limited data for any section, be honest about it rather than stretching thin evidence.
- The North Star should feel true enough that they'd put it on their wall. If the data doesn't support a strong one, say so and offer a tentative direction.

## Response format
Respond with ONLY valid JSON (no markdown, no code fences):
{
  "northStar": {
    "statement": "...",
    "ikigaiOverlaps": ["which circles overlap and how"],
    "alternatives": ["alternative 1", "alternative 2"]
  },
  "hiddenThread": {
    "theme": "...",
    "stories": [
      {
        "quote": "exact quote from profile",
        "summary": "brief story summary",
        "connectionToThread": "how this connects"
      }
    ],
    "explanation": "...",
    "alternativeInterpretation": "..."
  },
  "archetype": {
    "name": "The ...",
    "description": "...",
    "behavioralPattern": "...",
    "evidence": ["exact quote 1", "exact quote 2"],
    "limitations": "..."
  }
}`;
}

export function parseReportResponse(text: string): DiscoveryReport | null {
  try {
    // Try raw JSON first
    const direct = JSON.parse(text.trim());
    if (direct && direct.northStar) return wrapReport(direct);
  } catch {
    // continue
  }

  // Try closed code block
  const closedBlock = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (closedBlock) {
    try {
      const parsed = JSON.parse(closedBlock[1].trim());
      if (parsed && parsed.northStar) return wrapReport(parsed);
    } catch {
      // continue
    }
  }

  // Try unclosed code block
  const unclosedBlock = text.match(/```(?:json)?\s*\n([\s\S]+)$/);
  if (unclosedBlock) {
    try {
      const parsed = JSON.parse(unclosedBlock[1].trim());
      if (parsed && parsed.northStar) return wrapReport(parsed);
    } catch {
      // continue
    }
  }

  // Try brace-matching for embedded JSON
  const jsonStart = text.search(/\{\s*\n?\s*"northStar"/);
  if (jsonStart >= 0) {
    let depth = 0;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      if (depth === 0) {
        try {
          const parsed = JSON.parse(text.slice(jsonStart, i + 1));
          if (parsed && parsed.northStar) return wrapReport(parsed);
        } catch {
          // continue
        }
        break;
      }
    }
  }

  return null;
}

interface RawReport {
  northStar: {
    statement: string;
    ikigaiOverlaps: string[];
    alternatives: string[];
  };
  hiddenThread: {
    theme: string;
    stories: Array<{
      quote: string;
      summary: string;
      connectionToThread: string;
    }>;
    explanation: string;
    alternativeInterpretation: string;
  };
  archetype: {
    name: string;
    description: string;
    behavioralPattern: string;
    evidence: string[];
    limitations: string;
  };
}

function wrapReport(raw: RawReport): DiscoveryReport {
  return {
    version: 1,
    northStar: raw.northStar,
    hiddenThread: raw.hiddenThread,
    archetype: raw.archetype,
    generatedAt: new Date().toISOString(),
  };
}
