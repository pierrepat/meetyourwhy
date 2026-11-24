"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createEmptyProfile,
  Profile,
} from "@/lib/interview/profile";
import { ConversationMessage, getOpeningQuestion } from "@/lib/interview/engine";
import { useVoiceRecorder } from "@/lib/voice/use-voice-recorder";
import { detectDistress, CRISIS_RESOURCES } from "@/lib/safety/crisis-resources";
import { trackPixelEvent } from "@/lib/analytics/meta-pixel";
import { trackEvent } from "@/lib/analytics/posthog";
import { getStoredUtm } from "@/lib/analytics/utm";
import { isInstagramBrowser } from "@/lib/analytics/instagram-detect";

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  isMirrorMoment?: boolean;
  mirrorHandled?: boolean;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3">
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function DiscoveryProgress({ questionCount }: { questionCount: number }) {
  const discoveries = [
    { label: "North Star", threshold: 5 },
    { label: "Hidden Thread", threshold: 9 },
    { label: "Archetype", threshold: 12 },
  ];

  return (
    <div className="flex items-center gap-4">
      {discoveries.map((d, i) => {
        const progress = Math.min(1, Math.max(0, (questionCount - 1) / d.threshold));
        const unlocked = questionCount > d.threshold;

        return (
          <div key={i} className="flex items-center gap-1.5">
            <div className="relative w-2 h-2">
              <div className="absolute inset-0 rounded-full bg-border" />
              <div
                className={`absolute inset-0 rounded-full transition-all duration-1000 ease-out ${
                  unlocked ? "bg-accent scale-110" : "bg-accent"
                }`}
                style={{ opacity: unlocked ? 1 : progress * 0.6 }}
              />
              {unlocked && (
                <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
              )}
            </div>
            <span
              className={`text-[10px] tracking-wide uppercase transition-all duration-700 ${
                unlocked
                  ? "text-accent font-medium"
                  : progress > 0.3
                    ? "text-muted/70"
                    : "text-muted/30"
              }`}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MirrorButtons({
  onConfirm,
  onCorrect,
  onReject,
}: {
  onConfirm: () => void;
  onCorrect: () => void;
  onReject: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-4 justify-center">
      <button
        onClick={onConfirm}
        className="rounded-full border border-accent text-accent px-5 py-2.5 text-sm font-medium hover:bg-accent hover:text-white transition-colors"
      >
        That resonates
      </button>
      <button
        onClick={onCorrect}
        className="rounded-full border border-border text-foreground px-5 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
      >
        Not quite...
      </button>
      <button
        onClick={onReject}
        className="rounded-full border border-border text-muted px-5 py-2.5 text-sm font-medium hover:bg-surface transition-colors"
      >
        That&apos;s not me
      </button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function InterviewClient() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isIGBrowser, setIsIGBrowser] = useState(false);
  const [showDistressNotice, setShowDistressNotice] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<Profile>(createEmptyProfile);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const startedAtRef = useRef(0);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [pendingMirrorIndex, setPendingMirrorIndex] = useState<number | null>(
    null
  );
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleTranscription = useCallback((text: string) => {
    setInput(text);
    setVoiceError(null);
  }, []);

  const recorder = useVoiceRecorder(handleTranscription);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  useEffect(() => {
    setIsIGBrowser(isInstagramBrowser());
  }, []);

  useEffect(() => {
    startedAtRef.current = Date.now();
    const opening = getOpeningQuestion();
    setMessages([{ role: "assistant", content: opening }]);
    setQuestionCount(1);
    const timer = setTimeout(() => setIntroComplete(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      recorder.state === "idle" &&
      pendingMirrorIndex === null &&
      showTyping &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [isLoading, recorder.state, pendingMirrorIndex, showTyping]);

  useEffect(() => {
    if (recorder.error) {
      setVoiceError(recorder.error);
    }
  }, [recorder.error]);

  const sendMessage = useCallback(
    async (text: string, allMessages: ChatMessage[]) => {
      setIsLoading(true);

      const apiMessages: ConversationMessage[] = allMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      try {
        const res = await fetch("/api/interview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            profile,
            questionCount,
            startedAt: startedAtRef.current,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setProfile(data.profile);
        setQuestionCount((c) => c + 1);

        trackEvent("question_answered", {
          question_number: questionCount,
          input_method: recorder.state !== "idle" ? "voice" : "typed",
        });

        if (data.shouldEnd) {
          trackPixelEvent("interview_complete");
          trackEvent("interview_complete", {
            question_count: questionCount,
            ...getStoredUtm(),
          });
          sessionStorage.setItem(
            "meetyourwhy_profile",
            JSON.stringify(data.profile)
          );
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content:
                "Thank you so much for sharing all of that with me. I have a really clear picture of who you are and what drives you. Let me put together your results — this is going to be good.",
            },
          ]);
          setIsComplete(true);
        } else {
          const newMsg: ChatMessage = {
            role: "assistant",
            content: data.question,
            isMirrorMoment: data.isMirrorMoment || false,
          };
          setMessages((prev) => {
            const updated = [...prev, newMsg];
            if (data.isMirrorMoment) {
              setPendingMirrorIndex(updated.length - 1);
            }
            return updated;
          });
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I'm sorry, something went wrong on my end. Could you try sharing that again?",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [profile, questionCount]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    if (detectDistress(text)) {
      setShowDistressNotice(true);
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setVoiceError(null);

    await sendMessage(text, updatedMessages);
  }

  function handleMirrorResponse(
    response: "confirmed" | "corrected" | "rejected",
    correction?: string
  ) {
    if (pendingMirrorIndex === null) return;

    const mirrorMsg = messages[pendingMirrorIndex];

    setProfile((prev) => ({
      ...prev,
      mirrorMoments: [
        ...prev.mirrorMoments,
        {
          questionNumber: questionCount,
          reflection: mirrorMsg.content,
          response,
          correction,
        },
      ],
    }));

    setMessages((prev) =>
      prev.map((m, i) =>
        i === pendingMirrorIndex ? { ...m, mirrorHandled: true } : m
      )
    );

    setPendingMirrorIndex(null);
    setShowCorrectionInput(false);

    let responseText: string;
    if (response === "confirmed") {
      responseText = "Yes, that really resonates with me.";
    } else if (response === "corrected") {
      responseText = correction
        ? `Not quite — ${correction}`
        : "Not quite, but I'm not sure how to put it differently.";
    } else {
      responseText = "No, that doesn't feel like me.";
    }

    const userMessage: ChatMessage = { role: "user", content: responseText };
    const updatedMessages = [
      ...messages.map((m, i) =>
        i === pendingMirrorIndex ? { ...m, mirrorHandled: true } : m
      ),
      userMessage,
    ];
    setMessages(updatedMessages);

    sendMessage(responseText, updatedMessages);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  const isBusy =
    isLoading ||
    recorder.state === "transcribing" ||
    recorder.state === "requesting";

  const hasPendingMirror = pendingMirrorIndex !== null;
  const isRecording = recorder.state === "recording";
  const isTranscribing = recorder.state === "transcribing";
  const isRequesting = recorder.state === "requesting";

  const latestAssistantMsg = [...messages]
    .reverse()
    .find((m) => m.role === "assistant");

  const hasUserSpoken = messages.some((m) => m.role === "user");

  if (!ageConfirmed) {
    return (
      <div className="flex flex-col h-dvh bg-background items-center justify-center px-5">
        <div className="max-w-md w-full space-y-8 text-center animate-fade-slide-up">
          <Link
            href="/"
            className="font-serif text-2xl tracking-tight text-foreground"
          >
            MeetYourWhy
          </Link>
          {isIGBrowser && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-900 leading-relaxed">
              <p className="font-medium mb-1">For the best experience</p>
              <p>
                Voice input works best in Safari or Chrome. Tap the{" "}
                <span className="font-medium">&#8943;</span> menu above and
                choose{" "}
                <span className="font-medium">&ldquo;Open in browser&rdquo;</span>.
              </p>
              <p className="mt-1 text-xs text-amber-700">
                You can still continue here — typing works fine.
              </p>
            </div>
          )}
          <div className="space-y-3">
            <h1 className="text-xl font-serif text-foreground">
              Before we begin
            </h1>
            <p className="text-sm text-muted leading-relaxed">
              This is a reflective conversation about your life — your
              experiences, what drives you, and where you might be heading.
              It is not therapy or counseling.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              You must be 18 or older to continue.
            </p>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => {
                setAgeConfirmed(true);
                trackPixelEvent("discovery_start");
                trackEvent("discovery_start", {
                  ...getStoredUtm(),
                  is_instagram_browser: isInstagramBrowser(),
                });
              }}
              className="w-full rounded-full bg-foreground text-background px-6 py-3.5 font-medium transition-opacity hover:opacity-90"
            >
              I&apos;m 18 or older — let&apos;s go
            </button>
            <Link
              href="/"
              className="block text-sm text-muted hover:text-foreground transition-colors"
            >
              I&apos;m under 18
            </Link>
          </div>
          <p className="text-xs text-muted/60">
            By continuing, you agree to our{" "}
            <Link href="/privacy" className="underline hover:text-muted">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  if (showDistressNotice) {
    return (
      <div className="flex flex-col h-dvh bg-background items-center justify-center px-5">
        <div className="max-w-md w-full space-y-8 animate-fade-slide-up">
          <div className="space-y-4 text-center">
            <p className="text-xl font-serif text-foreground leading-relaxed">
              It sounds like you might be going through something really hard
              right now.
            </p>
            <p className="text-sm text-muted leading-relaxed">
              This conversation isn&apos;t the right place for that kind of
              support, but there are people who can help — right now, for free.
            </p>
          </div>

          <div className="space-y-3">
            {CRISIS_RESOURCES.map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-border bg-surface p-4 hover:border-accent/30 transition-colors"
              >
                <p className="font-semibold text-foreground">{resource.name}</p>
                <p className="text-sm text-accent font-medium">
                  {resource.contact}
                </p>
                <p className="text-xs text-muted mt-1">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>

          <div className="space-y-3 text-center">
            <button
              onClick={() => setShowDistressNotice(false)}
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              I&apos;m okay — continue the conversation
            </button>
            <div>
              <Link
                href="/"
                className="text-sm text-muted/60 hover:text-muted transition-colors"
              >
                End session
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      {/* Minimal header */}
      <header className="flex items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-serif text-base tracking-tight text-muted/60 hover:text-muted transition-colors"
        >
          MeetYourWhy
        </Link>
        {hasUserSpoken && (
          <div className="animate-fade-in">
            <DiscoveryProgress questionCount={questionCount} />
          </div>
        )}
      </header>

      {/* Main content — conversation-centered */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-xl mx-auto px-5 flex flex-col min-h-full">
          {/* Spacer pushes content toward center when conversation is short */}
          {messages.length <= 3 && <div className="flex-1 min-h-8" />}

          {/* Welcome text — only before first user message */}
          {!hasUserSpoken && introComplete && (
            <div className="text-center mb-8 animate-fade-slide-up">
              <p className="text-sm text-muted leading-relaxed">
                I&apos;m going to ask you some real questions about your life.
                <br />
                No right answers. Just tell me what comes to mind.
              </p>
            </div>
          )}

          {/* Conversation */}
          <div className="space-y-6 pb-6">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="animate-fade-slide-up"
                style={{ animationDelay: i === 0 ? "0ms" : "0ms" }}
              >
                {msg.role === "assistant" ? (
                  <div className="text-center">
                    {msg.isMirrorMoment && (
                      <div className="flex justify-center mb-3">
                        <div className="w-8 h-0.5 bg-accent/40" />
                      </div>
                    )}
                    <p
                      className={`text-lg md:text-xl font-serif leading-relaxed ${
                        msg.isMirrorMoment
                          ? "text-accent italic"
                          : "text-foreground"
                      }`}
                    >
                      {msg.content}
                    </p>
                    {msg.isMirrorMoment &&
                      !msg.mirrorHandled &&
                      pendingMirrorIndex === i && (
                        <>
                          {showCorrectionInput ? (
                            <div className="flex flex-col gap-2 mt-4 max-w-sm mx-auto">
                              <textarea
                                autoFocus
                                placeholder="What feels more accurate?"
                                className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none text-center"
                                rows={2}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    const val = (
                                      e.target as HTMLTextAreaElement
                                    ).value.trim();
                                    handleMirrorResponse(
                                      "corrected",
                                      val || undefined
                                    );
                                  }
                                }}
                              />
                              <button
                                onClick={() => setShowCorrectionInput(false)}
                                className="text-xs text-muted hover:text-foreground"
                              >
                                Back
                              </button>
                            </div>
                          ) : (
                            <MirrorButtons
                              onConfirm={() =>
                                handleMirrorResponse("confirmed")
                              }
                              onCorrect={() => setShowCorrectionInput(true)}
                              onReject={() => handleMirrorResponse("rejected")}
                            />
                          )}
                        </>
                      )}
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-foreground/5 border border-border px-5 py-3 text-[15px] leading-relaxed text-foreground/80">
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-center">
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Bottom spacer */}
          {messages.length <= 3 && <div className="flex-1 min-h-8" />}
        </div>
      </div>

      {/* Voice-first input area */}
      <div className="bg-background">
        <div className="max-w-xl mx-auto px-5 pb-8 pt-4">
          {voiceError && (
            <div className="mb-4 text-xs text-center text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {voiceError}
            </div>
          )}

          {isComplete ? (
            <Link
              href="/results"
              className="flex items-center justify-center w-full rounded-full bg-accent text-white px-6 py-4 font-medium text-lg transition-opacity hover:opacity-90"
            >
              See your results
            </Link>
          ) : showTyping ? (
            /* Typing mode */
            <div className="space-y-3">
              <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer..."
                  disabled={isBusy}
                  rows={2}
                  className="flex-1 resize-none rounded-2xl border border-border bg-surface px-5 py-3 text-[15px] leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isBusy}
                  className="self-end rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-30"
                >
                  Send
                </button>
              </form>
              <button
                type="button"
                onClick={() => setShowTyping(false)}
                className="w-full text-xs text-muted hover:text-foreground transition-colors"
              >
                Use voice instead
              </button>
            </div>
          ) : (
            /* Voice mode — the default */
            <div className="flex flex-col items-center gap-4">
              {/* Transcript preview when voice input is captured */}
              {input && !isRecording && !isTranscribing && (
                <div className="w-full space-y-3 animate-fade-slide-up">
                  <div className="rounded-2xl border border-border bg-surface px-5 py-3 text-[15px] leading-relaxed text-foreground/80">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      rows={2}
                      className="w-full bg-transparent resize-none focus:outline-none placeholder:text-muted/50"
                      placeholder="Edit if needed..."
                    />
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => setInput("")}
                      className="text-sm text-muted hover:text-foreground transition-colors"
                    >
                      Redo
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
                      disabled={isBusy}
                      className="rounded-full bg-accent text-white px-8 py-2.5 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-30"
                    >
                      Send
                    </button>
                  </div>
                </div>
              )}

              {/* Mic button — the hero */}
              {!input && (
                <>
                  {isRecording ? (
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                      <span className="text-sm text-muted">
                        {formatTime(recorder.elapsedSeconds)}
                      </span>
                      <button
                        type="button"
                        onClick={recorder.stopRecording}
                        className="relative w-20 h-20 rounded-full bg-red-500 text-white flex items-center justify-center transition-transform hover:scale-105"
                        aria-label="Stop recording"
                      >
                        <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={recorder.cancelRecording}
                        className="text-xs text-muted hover:text-foreground transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : isTranscribing || isRequesting ? (
                    <div className="flex flex-col items-center gap-3 animate-fade-in">
                      <div className="w-20 h-20 rounded-full bg-foreground/5 border border-border flex items-center justify-center">
                        <svg
                          className="animate-spin text-muted"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            strokeOpacity="0.25"
                          />
                          <path d="M12 2a10 10 0 0 1 10 10" />
                        </svg>
                      </div>
                      <span className="text-sm text-muted">
                        {isTranscribing
                          ? "Listening..."
                          : "Getting microphone..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={recorder.startRecording}
                        disabled={isBusy || hasPendingMirror}
                        className="group w-20 h-20 rounded-full bg-foreground text-background flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:hover:scale-100"
                        aria-label="Tap to speak"
                      >
                        <svg
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="9" y="2" width="6" height="12" rx="3" />
                          <path d="M5 10a7 7 0 0 0 14 0" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                      </button>
                      {!hasUserSpoken && (
                        <span className="text-sm text-muted animate-fade-in">
                          Tap to speak
                        </span>
                      )}
                    </div>
                  )}

                  {/* Type instead link */}
                  {!isRecording && !isTranscribing && !isRequesting && (
                    <button
                      type="button"
                      onClick={() => setShowTyping(true)}
                      className="text-xs text-muted/60 hover:text-muted transition-colors"
                    >
                      or type instead
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
