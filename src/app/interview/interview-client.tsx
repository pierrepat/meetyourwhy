"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  createEmptyProfile,
  Profile,
  getInterviewPhase,
  getInterviewProgress,
} from "@/lib/interview/profile";
import { ConversationMessage, getOpeningQuestion } from "@/lib/interview/engine";
import { useVoiceRecorder, RecorderState } from "@/lib/voice/use-voice-recorder";

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

function PhaseIndicator({
  phase,
  progress,
}: {
  phase: string;
  progress: number;
}) {
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <span className="whitespace-nowrap">{phase}</span>
      <div className="w-16 h-1 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
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
    <div className="flex flex-wrap gap-2 mt-3">
      <button
        onClick={onConfirm}
        className="rounded-full border border-accent text-accent px-4 py-2 text-sm font-medium hover:bg-accent hover:text-white transition-colors"
      >
        That resonates
      </button>
      <button
        onClick={onCorrect}
        className="rounded-full border border-border text-foreground px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
      >
        Not quite...
      </button>
      <button
        onClick={onReject}
        className="rounded-full border border-border text-muted px-4 py-2 text-sm font-medium hover:bg-surface transition-colors"
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

function MicButton({
  recorderState,
  elapsedSeconds,
  onStart,
  onStop,
  onCancel,
  disabled,
}: {
  recorderState: RecorderState;
  elapsedSeconds: number;
  onStart: () => void;
  onStop: () => void;
  onCancel: () => void;
  disabled: boolean;
}) {
  if (recorderState === "recording") {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-2.5 text-muted hover:text-foreground transition-colors"
          aria-label="Cancel recording"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <span className="text-xs text-muted tabular-nums min-w-[3ch]">
          {formatTime(elapsedSeconds)}
        </span>
        <button
          type="button"
          onClick={onStop}
          className="relative rounded-full bg-red-500 text-white p-3.5 transition-opacity hover:opacity-90"
          aria-label="Stop recording"
        >
          <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        </button>
      </div>
    );
  }

  if (recorderState === "transcribing") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Transcribing...
      </div>
    );
  }

  if (recorderState === "requesting") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted">
        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
          <path d="M12 2a10 10 0 0 1 10 10" />
        </svg>
        Requesting mic...
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onStart}
      disabled={disabled}
      className="rounded-full bg-foreground text-background p-3.5 transition-opacity hover:opacity-85 disabled:opacity-30"
      aria-label="Start voice recording"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="2" width="6" height="12" rx="3" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    </button>
  );
}

export default function InterviewClient() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [profile, setProfile] = useState<Profile>(createEmptyProfile);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const startedAtRef = useRef(0);
  const [isComplete, setIsComplete] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [pendingMirrorIndex, setPendingMirrorIndex] = useState<number | null>(null);
  const [showCorrectionInput, setShowCorrectionInput] = useState(false);

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
    startedAtRef.current = Date.now();
    const opening = getOpeningQuestion();
    setMessages([{ role: "assistant", content: opening }]);
    setQuestionCount(1);
  }, []);

  useEffect(() => {
    if (
      !isLoading &&
      recorder.state === "idle" &&
      pendingMirrorIndex === null &&
      inputRef.current
    ) {
      inputRef.current.focus();
    }
  }, [isLoading, recorder.state, pendingMirrorIndex]);

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

        if (data.shouldEnd) {
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

    const userMessage: ChatMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setVoiceError(null);

    await sendMessage(text, updatedMessages);
  }

  function handleMirrorResponse(response: "confirmed" | "corrected" | "rejected", correction?: string) {
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
      responseText =
        "Yes, that really resonates with me.";
    } else if (response === "corrected") {
      responseText = correction
        ? `Not quite — ${correction}`
        : "Not quite, but I'm not sure how to put it differently.";
    } else {
      responseText =
        "No, that doesn't feel like me.";
    }

    const userMessage: ChatMessage = { role: "user", content: responseText };
    const updatedMessages = [...messages.map((m, i) =>
      i === pendingMirrorIndex ? { ...m, mirrorHandled: true } : m
    ), userMessage];
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

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/" className="font-serif text-lg tracking-tight">
          MeetYourWhy
        </Link>
        <PhaseIndicator
          phase={getInterviewPhase(questionCount)}
          progress={getInterviewProgress(questionCount)}
        />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
          {messages.map((msg, i) => (
            <div key={i}>
              <div
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${
                    msg.role === "user"
                      ? "bg-foreground text-background rounded-br-sm"
                      : msg.isMirrorMoment
                        ? "bg-accent/10 border border-accent/30 rounded-bl-sm"
                        : "bg-surface border border-border rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
              {msg.isMirrorMoment &&
                !msg.mirrorHandled &&
                pendingMirrorIndex === i && (
                  <div className="flex justify-start mt-1">
                    <div className="max-w-[85%]">
                      {showCorrectionInput ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <textarea
                            autoFocus
                            placeholder="What feels more accurate?"
                            className="rounded-xl border border-border bg-surface px-4 py-2.5 text-sm leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 resize-none"
                            rows={2}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                const val = (e.target as HTMLTextAreaElement).value.trim();
                                handleMirrorResponse("corrected", val || undefined);
                              }
                            }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => setShowCorrectionInput(false)}
                              className="text-xs text-muted hover:text-foreground"
                            >
                              Back
                            </button>
                          </div>
                        </div>
                      ) : (
                        <MirrorButtons
                          onConfirm={() => handleMirrorResponse("confirmed")}
                          onCorrect={() => setShowCorrectionInput(true)}
                          onReject={() => handleMirrorResponse("rejected")}
                        />
                      )}
                    </div>
                  </div>
                )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-surface border border-border rounded-2xl rounded-bl-sm">
                <TypingIndicator />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border bg-background">
        <div className="max-w-2xl mx-auto px-5 py-4">
          {voiceError && (
            <div className="mb-3 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {voiceError}
            </div>
          )}

          {isComplete ? (
            <Link
              href="/results"
              className="flex items-center justify-center w-full rounded-full bg-accent text-white px-6 py-3.5 font-medium transition-opacity hover:opacity-90"
            >
              See your results
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="flex items-end gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  hasPendingMirror
                    ? "Use the buttons above, or type your thoughts..."
                    : recorder.state === "recording"
                      ? "Recording... tap the stop button when done"
                      : recorder.state === "transcribing"
                        ? "Transcribing your answer..."
                        : "Share your thoughts... or tap the mic"
                }
                disabled={isBusy || recorder.state === "recording"}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-border bg-surface px-5 py-3 text-[15px] leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
              />
              {input.trim() ? (
                <button
                  type="submit"
                  disabled={isBusy}
                  className="self-end rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-30"
                >
                  Send
                </button>
              ) : (
                <MicButton
                  recorderState={recorder.state}
                  elapsedSeconds={recorder.elapsedSeconds}
                  onStart={recorder.startRecording}
                  onStop={recorder.stopRecording}
                  onCancel={recorder.cancelRecording}
                  disabled={isBusy}
                />
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
