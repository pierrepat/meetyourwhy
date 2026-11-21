"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Profile } from "@/lib/interview/profile";
import {
  DiscoveryReport,
  NorthStar,
  HiddenThread,
  Archetype,
} from "@/lib/report/schema";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; report: DiscoveryReport };

type Step = "north-star" | "hidden-thread" | "archetype" | "share";

const STEPS: Step[] = ["north-star", "hidden-thread", "archetype", "share"];

export default function ResultsClient() {
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });
  const [step, setStep] = useState<Step>("north-star");
  const [northStarText, setNorthStarText] = useState("");
  const [archetypeName, setArchetypeName] = useState("");
  const [editing, setEditing] = useState<"north-star" | "archetype" | null>(null);
  const [confirmed, setConfirmed] = useState<Set<Step>>(new Set());
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem("meetyourwhy_profile");
    if (!raw) {
      setLoadState({
        status: "error",
        message: "No interview data found. Please complete the interview first.",
      });
      return;
    }

    let profile: Profile;
    try {
      profile = JSON.parse(raw);
    } catch {
      setLoadState({ status: "error", message: "Invalid interview data." });
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
        setLoadState({ status: "ready", report: data.report });
        setNorthStarText(data.report.northStar.statement);
        setArchetypeName(data.report.archetype.name);
      } catch (err) {
        setLoadState({
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

  const goTo = useCallback((next: Step) => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(next);
      setEditing(null);
      setFadeIn(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }, []);

  const confirmStep = useCallback(
    (s: Step) => {
      setConfirmed((prev) => new Set(prev).add(s));
      const idx = STEPS.indexOf(s);
      if (idx < STEPS.length - 1) {
        goTo(STEPS[idx + 1]);
      }
    },
    [goTo]
  );

  if (loadState.status === "loading") {
    return <LoadingScreen />;
  }

  if (loadState.status === "error") {
    return <ErrorScreen message={loadState.message} />;
  }

  const { report } = loadState;
  const stepIndex = STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground"
          >
            MeetYourWhy
          </Link>
          <StepIndicator current={stepIndex} total={STEPS.length} />
        </div>
      </header>

      <main
        className={`max-w-2xl mx-auto px-6 py-10 md:py-16 transition-opacity duration-300 ${
          fadeIn ? "opacity-100" : "opacity-0"
        }`}
      >
        {step === "north-star" && (
          <NorthStarScreen
            northStar={report.northStar}
            text={northStarText}
            setText={setNorthStarText}
            editing={editing === "north-star"}
            onEdit={() => setEditing("north-star")}
            onConfirm={() => confirmStep("north-star")}
            onSelectAlternative={(alt) => {
              setNorthStarText(alt);
              setEditing(null);
            }}
          />
        )}

        {step === "hidden-thread" && (
          <HiddenThreadScreen
            hiddenThread={report.hiddenThread}
            onConfirm={() => confirmStep("hidden-thread")}
          />
        )}

        {step === "archetype" && (
          <ArchetypeScreen
            archetype={report.archetype}
            name={archetypeName}
            setName={setArchetypeName}
            editing={editing === "archetype"}
            onEdit={() => setEditing("archetype")}
            onConfirm={() => confirmStep("archetype")}
          />
        )}

        {step === "share" && (
          <ShareScreen
            northStar={northStarText}
            archetype={archetypeName}
            hiddenThreadTheme={report.hiddenThread.theme}
            onBack={() => goTo("north-star")}
          />
        )}
      </main>

      {step !== "north-star" && step !== "share" && (
        <div className="fixed bottom-6 left-6">
          <button
            onClick={() => goTo(STEPS[stepIndex - 1])}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            &larr; Back
          </button>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 rounded-full transition-all duration-300 ${
            i === current
              ? "w-6 bg-accent"
              : i < current
                ? "w-3 bg-accent/40"
                : "w-3 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <div className="w-12 h-12 mx-auto rounded-full border-2 border-accent border-t-transparent animate-spin" />
        <h2 className="text-xl font-semibold text-foreground">
          Putting your results together...
        </h2>
        <p className="text-muted text-sm">
          This takes about 15 seconds. We&apos;re finding the patterns in your
          stories.
        </p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="max-w-md text-center space-y-6">
        <p className="text-foreground">{message}</p>
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

function PrimaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full bg-accent text-white px-8 py-3 font-medium hover:bg-accent-light transition-colors"
    >
      {children}
    </button>
  );
}

function SecondaryButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-full border border-border text-foreground px-6 py-3 text-sm hover:border-accent/40 transition-colors"
    >
      {children}
    </button>
  );
}

/* ─── Screen 1: North Star ─── */

function NorthStarScreen({
  northStar,
  text,
  setText,
  editing,
  onEdit,
  onConfirm,
  onSelectAlternative,
}: {
  northStar: NorthStar;
  text: string;
  setText: (s: string) => void;
  editing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
  onSelectAlternative: (alt: string) => void;
}) {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-medium">
          Your North Star
        </p>
        <p className="text-sm text-muted">
          This is your direction — the thread that runs through everything.
        </p>
      </div>

      {editing ? (
        <div className="space-y-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xl md:text-2xl font-semibold leading-snug text-foreground bg-transparent border-b-2 border-accent/30 focus:border-accent outline-none resize-none py-2"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-muted">
            {text.length}/200 characters
          </p>

          <div className="space-y-3">
            <p className="text-xs text-muted font-medium">
              Or pick one of these:
            </p>
            {northStar.alternatives.map((alt, i) => (
              <button
                key={i}
                onClick={() => onSelectAlternative(alt)}
                className="block w-full text-left rounded-xl border border-border hover:border-accent/40 p-4 text-sm text-foreground/80 italic transition-colors"
              >
                &ldquo;{alt}&rdquo;
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <PrimaryButton onClick={onConfirm}>This feels right</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <blockquote className="text-2xl md:text-3xl font-semibold leading-snug text-foreground font-serif">
            {text}
          </blockquote>

          <div className="flex flex-col sm:flex-row gap-3">
            <PrimaryButton onClick={onConfirm}>This feels right</PrimaryButton>
            <SecondaryButton onClick={onEdit}>Not quite — let me adjust</SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Screen 2: Hidden Thread ─── */

function HiddenThreadScreen({
  hiddenThread,
  onConfirm,
}: {
  hiddenThread: HiddenThread;
  onConfirm: () => void;
}) {
  const [visibleStories, setVisibleStories] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    hiddenThread.stories.forEach((_, i) => {
      timers.push(
        setTimeout(() => setVisibleStories(i + 1), 600 + i * 800)
      );
    });
    timers.push(
      setTimeout(
        () => setShowExplanation(true),
        600 + hiddenThread.stories.length * 800 + 400
      )
    );
    return () => timers.forEach(clearTimeout);
  }, [hiddenThread.stories]);

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-medium">
          Your Hidden Thread
        </p>
        <p className="text-lg md:text-xl font-medium text-foreground font-serif">
          {hiddenThread.theme}
        </p>
      </div>

      {/* Story timeline */}
      <div className="relative pl-6 border-l-2 border-accent/20 space-y-8">
        {hiddenThread.stories.map((story, i) => (
          <div
            key={i}
            className={`relative transition-all duration-500 ${
              i < visibleStories
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {/* Timeline dot */}
            <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full bg-accent/60 border-2 border-background" />

            <div className="space-y-2">
              <blockquote className="text-foreground italic leading-relaxed">
                &ldquo;{story.quote}&rdquo;
              </blockquote>
              <p className="text-sm text-muted">{story.summary}</p>
              <p className="text-sm text-foreground/70">
                {story.connectionToThread}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation card */}
      <div
        className={`bg-surface rounded-xl p-6 space-y-4 transition-all duration-500 ${
          showExplanation
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-sm text-foreground leading-relaxed">
          {hiddenThread.explanation}
        </p>
        <div className="pt-3 border-t border-border/30">
          <p className="text-xs text-muted mb-1">Another way to read this:</p>
          <p className="text-sm text-muted/80 italic">
            {hiddenThread.alternativeInterpretation}
          </p>
        </div>
      </div>

      <div
        className={`transition-all duration-300 ${
          showExplanation ? "opacity-100" : "opacity-0"
        }`}
      >
        <PrimaryButton onClick={onConfirm}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

/* ─── Screen 3: Archetype ─── */

function ArchetypeScreen({
  archetype,
  name,
  setName,
  editing,
  onEdit,
  onConfirm,
}: {
  archetype: Archetype;
  name: string;
  setName: (s: string) => void;
  editing: boolean;
  onEdit: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-muted font-medium">
          Your Archetype
        </p>
        <p className="text-sm text-muted">
          A name for the pattern that shows up across your stories.
        </p>
      </div>

      {editing ? (
        <div className="space-y-6">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-2xl md:text-3xl font-semibold text-foreground bg-transparent border-b-2 border-accent/30 focus:border-accent outline-none py-2"
            maxLength={60}
          />
          <p className="text-xs text-muted">
            {name.length}/60 characters
          </p>
          <div className="flex gap-3 pt-2">
            <PrimaryButton onClick={onConfirm}>This feels right</PrimaryButton>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground font-serif">
            {name}
          </h2>

          <p className="text-foreground/90 leading-relaxed">
            {archetype.description}
          </p>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">
              How it shows up:
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {archetype.behavioralPattern}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">In your words:</p>
            {archetype.evidence.map((quote, i) => (
              <blockquote
                key={i}
                className="border-l-2 border-accent/40 pl-4 text-sm text-foreground/80 italic"
              >
                &ldquo;{quote}&rdquo;
              </blockquote>
            ))}
          </div>

          <div className="bg-surface rounded-xl p-5">
            <p className="text-xs text-muted mb-1">Worth watching:</p>
            <p className="text-sm text-foreground/80">
              {archetype.limitations}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <PrimaryButton onClick={onConfirm}>This feels right</PrimaryButton>
            <SecondaryButton onClick={onEdit}>
              Not quite — let me adjust
            </SecondaryButton>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Screen 4: Share ─── */

function ShareScreen({
  northStar,
  archetype,
  hiddenThreadTheme,
  onBack,
}: {
  northStar: string;
  archetype: string;
  hiddenThreadTheme: string;
  onBack: () => void;
}) {
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `I just discovered my North Star: "${northStar}" — and my archetype is ${archetype}.\n\nWant to find yours? meetyourwhy.com`;

  async function handlePrivateShare() {
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch {
        // User cancelled — not an error
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard API blocked — fall back to prompt
        window.prompt("Copy this text to share:", shareText);
      }
    }
  }

  async function handleDownloadCard() {
    setGenerating(true);
    try {
      const { generateStoryCard, downloadBlob } = await import(
        "@/lib/share/story-card"
      );
      const blob = await generateStoryCard(
        northStar,
        archetype,
        hiddenThreadTheme
      );
      downloadBlob(blob, "meetyourwhy-discovery.png");
    } catch (err) {
      console.error("Card generation failed:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="space-y-10">
      <div className="space-y-3 text-center">
        <p className="text-xs uppercase tracking-widest text-muted font-medium">
          Your Discovery
        </p>
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground font-serif">
          Here&apos;s what we found
        </h2>
      </div>

      {/* Summary card */}
      <div className="bg-surface rounded-xl p-6 md:p-8 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            North Star
          </p>
          <p className="text-lg font-semibold text-foreground">{northStar}</p>
        </div>
        <hr className="border-border/30" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Hidden Thread
          </p>
          <p className="text-sm text-foreground/80 italic">
            {hiddenThreadTheme}
          </p>
        </div>
        <hr className="border-border/30" />
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-muted font-medium">
            Archetype
          </p>
          <p className="text-lg font-semibold text-foreground">{archetype}</p>
        </div>
      </div>

      {/* Primary: private share */}
      <div className="text-center space-y-3">
        <p className="text-sm text-foreground/80">
          Send this to someone who knows you.
          <br />
          Ask them: <span className="italic">is this me?</span>
        </p>
        <button
          onClick={handlePrivateShare}
          className="rounded-full bg-accent text-white px-8 py-3 font-medium hover:bg-accent-light transition-colors"
        >
          {copied ? "Copied to clipboard!" : "Share with someone"}
        </button>
      </div>

      {/* Secondary: Instagram Story card */}
      <div className="text-center space-y-3">
        <p className="text-xs text-muted">Or save as an image for your story</p>
        <button
          onClick={handleDownloadCard}
          disabled={generating}
          className="rounded-full border border-border text-foreground px-6 py-3 text-sm hover:border-accent/40 transition-colors disabled:opacity-50"
        >
          {generating ? "Creating image..." : "Download Instagram Story"}
        </button>
      </div>

      {/* Navigation */}
      <div className="text-center space-y-3 pt-4">
        <button
          onClick={onBack}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          Review your results again
        </button>
        <div>
          <Link
            href="/interview"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Start a new interview
          </Link>
        </div>
      </div>
    </div>
  );
}
