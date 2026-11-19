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
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const text =
      response.content[0].type === "text" ? response.content[0].text : "";

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        question: text,
        strategy: "fill_gap",
        profileUpdates: {},
        shouldEnd: false,
      };
    }

    const updatedProfile = applyProfileUpdates(
      profile,
      parsed.profileUpdates || {}
    );

    return NextResponse.json({
      question: parsed.question,
      profile: updatedProfile,
      strategy: parsed.strategy,
      shouldEnd: parsed.shouldEnd || false,
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
