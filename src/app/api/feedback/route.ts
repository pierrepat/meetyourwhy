import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      understoodRating,
      surprisingLine,
      gotWrong,
      callOptIn,
      callEmail,
      utm,
    } = body;

    if (
      typeof understoodRating !== "number" ||
      understoodRating < 1 ||
      understoodRating > 5
    ) {
      return NextResponse.json(
        { error: "Rating must be 1-5." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("tester_feedback").insert({
      understood_rating: understoodRating,
      surprising_line: String(surprisingLine || "").slice(0, 2000),
      got_wrong: String(gotWrong || "").slice(0, 2000),
      call_opt_in: !!callOptIn,
      call_email: String(callEmail || "").slice(0, 320),
      utm_source: String(utm?.utm_source || "").slice(0, 200),
      utm_medium: String(utm?.utm_medium || "").slice(0, 200),
      utm_campaign: String(utm?.utm_campaign || "").slice(0, 200),
      utm_content: String(utm?.utm_content || "").slice(0, 200),
      utm_term: String(utm?.utm_term || "").slice(0, 200),
    });

    if (error) {
      console.error("Feedback insert error:", error.message);
      return NextResponse.json(
        { error: "Failed to save feedback." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}
