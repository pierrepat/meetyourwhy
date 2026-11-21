import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt,
  applyProfileUpdates,
  ConversationMessage,
} from "@/lib/interview/engine";
import { Profile } from "@/lib/interview/profile";

const anthropic = new Anthropic();

function tryParse(str: string): Record<string, unknown> | null {
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === "object" && "question" in obj) return obj;
    return null;
  } catch {
    return null;
  }
}

function extractJson(text: string): Record<string, unknown> | null {
  // Try 1: Entire text is valid JSON
  const direct = tryParse(text.trim());
  if (direct) return direct;

  // Try 2: JSON in a closed code block (```json ... ```)
  const closedBlock = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (closedBlock) {
    const result = tryParse(closedBlock[1].trim());
    if (result) return result;
  }

  // Try 3: JSON in an unclosed code block (AI forgot closing ```)
  const unclosedBlock = text.match(/```(?:json)?\s*\n([\s\S]+)$/);
  if (unclosedBlock) {
    const result = tryParse(unclosedBlock[1].trim());
    if (result) return result;
  }

  // Try 4: Find a JSON object containing "question" by brace-matching
  const jsonStart = text.search(/\{\s*\n?\s*"question"/);
  if (jsonStart >= 0) {
    let depth = 0;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      if (depth === 0) {
        const result = tryParse(text.slice(jsonStart, i + 1));
        if (result) return result;
        break;
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      profile,
      questionCount,
      startedAt,
    }: {
      messages: ConversationMessage[];
      profile: Profile;
      questionCount: number;
      startedAt: number;
    } = body;

    const elapsedMs = Date.now() - startedAt;
    const systemPrompt = buildSystemPrompt(profile, questionCount, elapsedMs);

    const response = await anthropic.messages.create({
      model: "claude-haiku-5-5",
      max_tokens: 2048,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    let parsed = extractJson(text);
    if (!parsed) {
      parsed = {
        question: text,
        strategy: "explore",
        profileUpdates: {},
        shouldEnd: false,
        isMirrorMoment: false,
      };
    }

    const updatedProfile = applyProfileUpdates(
      profile,
      (parsed.profileUpdates as Record<string, unknown>) || {},
      questionCount
    );

    const rawQuestion = parsed.question as string | undefined;
    const question =
      rawQuestion && rawQuestion.trim()
        ? rawQuestion
        : "That's really interesting — tell me more about that. What was going through your mind?";

    return NextResponse.json({
      question,
      profile: updatedProfile,
      strategy: parsed.strategy,
      shouldEnd: parsed.shouldEnd || false,
      isMirrorMoment: parsed.isMirrorMoment || false,
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
