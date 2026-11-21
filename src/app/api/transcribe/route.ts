import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  let audioFile: File | null = null;

  try {
    const formData = await req.formData();
    audioFile = formData.get("audio") as File | null;

    if (!audioFile || audioFile.size === 0) {
      return NextResponse.json(
        { error: "No audio provided" },
        { status: 400 }
      );
    }

    if (audioFile.size > 25 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Audio file too large (max 25MB)" },
        { status: 400 }
      );
    }

    const transcription = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
      language: "en",
    });

    // Audio is never stored — the File object from formData exists only
    // in memory for this request and is garbage-collected when the
    // handler returns. No disk writes, no logging of transcript text.
    audioFile = null;

    return NextResponse.json({ text: transcription.text });
  } catch {
    // Never log transcript text or audio details in error output
    console.error("Transcription failed");
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 500 }
    );
  }
}
