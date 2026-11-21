import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  buildSystemPrompt,
  applyProfileUpdates,
  ConversationMessage,
} from "@/lib/interview/engine";
import { Profile } from "@/lib/interview/profile";

const anthropic = new Anthropic();

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

    let parsed;
    try {
      // The AI may return: (a) raw JSON, (b) code-fenced JSON, or
      // (c) plain text followed by a code-fenced JSON block.
      // Extract the JSON from a code block if present, otherwise try the whole text.
      const codeBlockMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      const jsonText = codeBlockMatch
        ? codeBlockMatch[1].trim()
        : text
            .replace(/^```(?:json)?\s*\n?/i, "")
            .replace(/\n?```\s*$/i, "")
            .trim();
      parsed = JSON.parse(jsonText);
    } catch {
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
      parsed.profileUpdates || {},
      questionCount
    );

    const question =
      parsed.question && parsed.question.trim()
        ? parsed.question
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
