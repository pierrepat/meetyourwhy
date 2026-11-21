import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { northStar, hiddenThreadTheme, archetypeName, referrerToken } = body;

    if (!northStar || !hiddenThreadTheme || !archetypeName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("shared_results")
      .insert({
        north_star: northStar,
        hidden_thread_theme: hiddenThreadTheme,
        archetype_name: archetypeName,
        referrer_token: referrerToken || null,
      })
      .select("share_token")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create share" },
        { status: 500 }
      );
    }

    return NextResponse.json({ shareToken: data.share_token });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
