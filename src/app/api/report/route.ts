import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Profile } from "@/lib/interview/profile";
import { buildReportPrompt, parseReportResponse } from "@/lib/report/generate";
import { checkRateLimit } from "@/lib/rate-limit";

const anthropic = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const rateCheck = checkRateLimit(req);
    if (!rateCheck.ok) {
      return NextResponse.json(
        { error: rateCheck.error },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { profile }: { profile: Profile } = body;

    if (!profile || !profile.ikigai) {
      return NextResponse.json(
        { error: "Invalid profile data." },
        { status: 400 }
      );
    }

    const systemPrompt = buildReportPrompt(profile);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-5-5",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content:
            "Generate my discovery report based on the interview notes. Use only real quotes and stories from the notes.",
        },
      ],
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";

    const report = parseReportResponse(text);

    if (!report) {
      console.error("Failed to parse report response:", text.slice(0, 500));
      return NextResponse.json(
        { error: "Failed to generate report. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error("Report API error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating your report." },
      { status: 500 }
    );
  }
}
