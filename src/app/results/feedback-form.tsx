"use client";

import { useState } from "react";
import { getStoredUtm } from "@/lib/analytics/utm";
import { trackEvent } from "@/lib/analytics/posthog";

interface FeedbackData {
  understoodRating: number;
  surprisingLine: string;
  gotWrong: string;
  callOptIn: boolean;
  callEmail: string;
}

export function FeedbackForm() {
  const [rating, setRating] = useState<number | null>(null);
  const [surprisingLine, setSurprisingLine] = useState("");
  const [gotWrong, setGotWrong] = useState("");
  const [callOptIn, setCallOptIn] = useState(false);
  const [callEmail, setCallEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!rating) return;
    setSubmitting(true);

    const feedback: FeedbackData = {
      understoodRating: rating,
      surprisingLine,
      gotWrong,
      callOptIn,
      callEmail: callOptIn ? callEmail : "",
    };

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedback,
          utm: getStoredUtm(),
        }),
      });
    } catch {
      // Silently fail — feedback is non-critical
    }

    trackEvent("feedback_submitted", {
      understood_rating: rating,
      has_surprising_line: !!surprisingLine,
      has_got_wrong: !!gotWrong,
      call_opt_in: callOptIn,
      ...getStoredUtm(),
    });
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className="text-center py-6">
        <p className="text-sm text-muted">Thank you for your feedback.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl p-6 space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">
          How understood did you feel?
        </p>
        <div className="flex gap-2 justify-center pt-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={`w-11 h-11 rounded-full text-sm font-medium transition-all ${
                rating === n
                  ? "bg-accent text-white scale-110"
                  : "bg-background border border-border text-foreground hover:border-accent/40"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-muted px-1 pt-1">
          <span>Not at all</span>
          <span>Completely</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          Which line surprised you?
        </label>
        <textarea
          value={surprisingLine}
          onChange={(e) => setSurprisingLine(e.target.value)}
          placeholder="A specific line or insight that felt true..."
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground block">
          What did it get wrong?
        </label>
        <textarea
          value={gotWrong}
          onChange={(e) => setGotWrong(e.target.value)}
          placeholder="Anything that felt off or inaccurate..."
          rows={2}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
        />
      </div>

      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={callOptIn}
            onChange={(e) => setCallOptIn(e.target.checked)}
            className="mt-0.5 rounded border-border text-accent focus:ring-accent/30"
          />
          <span className="text-sm text-foreground leading-relaxed">
            I&apos;d be open to a 10-minute call to share more about my
            experience
          </span>
        </label>

        {callOptIn && (
          <input
            type="email"
            value={callEmail}
            onChange={(e) => setCallEmail(e.target.value)}
            placeholder="Your email"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30"
          />
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!rating || submitting}
        className="w-full rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        {submitting ? "Sending..." : "Send feedback"}
      </button>
    </div>
  );
}
