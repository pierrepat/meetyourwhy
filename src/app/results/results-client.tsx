"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Profile } from "@/lib/interview/profile";
import { DiscoveryReport } from "@/lib/report/schema";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; report: DiscoveryReport };

export default function ResultsClient() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    const raw = sessionStorage.getItem("meetyourwhy_profile");
    if (!raw) {
      setState({
        status: "error",
        message: "No interview data found. Please complete the interview first.",
      });
      return;
    }

    let profile: Profile;
    try {
      profile = JSON.parse(raw);
    } catch {
      setState({ status: "error", message: "Invalid interview data." });
      return;
    }

    async function generateReport() {
      try {
        const res = await fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "Failed to generate report.");
        }

        const data = await res.json();
        setState({ status: "ready", report: data.report });
      } catch (err) {
        setState({
          status: "error",
          message:
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        });
      }
    }

    generateReport();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-6">
          <div className="w-12 h-12 mx-auto rounded-full border-2 border-accent border-t-transparent animate-spin" />
          <h2 className="text-xl font-semibold text-foreground">
            Putting your results together...
          </h2>
          <p className="text-muted text-sm">
            This takes about 15 seconds. We're finding the patterns in your stories.
          </p>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-6">
          <p className="text-foreground">{state.message}</p>
          <Link
            href="/interview"
            className="inline-block rounded-full bg-accent text-white px-6 py-3 font-medium"
          >
            Start the interview
          </Link>
        </div>
      </div>
    );
  }

  const { report } = state;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            MeetYourWhy
          </Link>
          <span className="text-xs text-muted">Your Discovery</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-16">
        {/* North Star */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Your North Star
          </p>
          <blockquote className="text-2xl md:text-3xl font-semibold leading-snug text-foreground">
            {report.northStar.statement}
          </blockquote>
          <div className="space-y-2 pt-2">
            <p className="text-xs text-muted">Other ways to say it:</p>
            {report.northStar.alternatives.map((alt, i) => (
              <p key={i} className="text-sm text-muted/80 italic">
                "{alt}"
              </p>
            ))}
          </div>
        </section>

        <hr className="border-border/30" />

        {/* Hidden Thread */}
        <section className="space-y-6">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Your Hidden Thread
          </p>
          <p className="text-lg font-medium text-foreground">
            {report.hiddenThread.theme}
          </p>

          <div className="space-y-6">
            {report.hiddenThread.stories.map((story, i) => (
              <div key={i} className="space-y-2">
                <blockquote className="border-l-2 border-accent/40 pl-4 text-foreground italic">
                  "{story.quote}"
                </blockquote>
                <p className="text-sm text-muted">{story.summary}</p>
                <p className="text-sm text-foreground/80">
                  {story.connectionToThread}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl p-5 space-y-3">
            <p className="text-sm text-foreground">
              {report.hiddenThread.explanation}
            </p>
            <div className="pt-2 border-t border-border/30">
              <p className="text-xs text-muted mb-1">Another way to read this:</p>
              <p className="text-sm text-muted/80 italic">
                {report.hiddenThread.alternativeInterpretation}
              </p>
            </div>
          </div>
        </section>

        <hr className="border-border/30" />

        {/* Archetype */}
        <section className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Your Archetype
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-foreground">
            {report.archetype.name}
          </h2>
          <p className="text-foreground/90 leading-relaxed">
            {report.archetype.description}
          </p>

          <div className="space-y-3 pt-2">
            <p className="text-sm font-medium text-foreground">
              How it shows up:
            </p>
            <p className="text-sm text-foreground/80">
              {report.archetype.behavioralPattern}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-foreground">In your words:</p>
            {report.archetype.evidence.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-accent/40 pl-4 text-sm text-foreground/80 italic"
              >
                "{quote}"
              </blockquote>
            ))}
          </div>

          <div className="bg-surface rounded-xl p-5 mt-4">
            <p className="text-xs text-muted mb-1">Worth watching:</p>
            <p className="text-sm text-foreground/80">
              {report.archetype.limitations}
            </p>
          </div>
        </section>

        <div className="pt-8 pb-16 text-center">
          <Link
            href="/interview"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Start a new interview
          </Link>
        </div>
      </main>
    </div>
  );
}
