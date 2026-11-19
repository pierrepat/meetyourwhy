"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { createEmptyProfile, Profile, getOverallConfidence } from "@/lib/interview/profile";
import { ConversationMessage, getOpeningQuestion } from "@/lib/interview/engine";

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-5 py-3">
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
      <div className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

function ProgressBar({ confidence }: { confidence: number }) {
  const pct = Math.min(Math.round(confidence * 100), 100);
  return (
    <div className="flex items-center gap-3 text-xs text-muted">
      <div className="flex-1 h-1 rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-accent transition-all duration-700 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span>{pct}%</span>
    </div>
  );
}

export default function InterviewClient() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [profile, setProfile] = useState<Profile>(createEmptyProfile);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const startedAtRef = useRef(0);
  const [isComplete, setIsComplete] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    if (!isLoading && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    const userMessage: ConversationMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
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
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.question },
        ]);
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
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-dvh bg-background">
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <Link href="/" className="font-serif text-lg tracking-tight">
          MeetYourWhy
        </Link>
        <ProgressBar confidence={getOverallConfidence(profile)} />
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-3 text-[15px] leading-relaxed ${
                  msg.role === "user"
                    ? "bg-foreground text-background rounded-br-sm"
                    : "bg-surface border border-border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
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
          {isComplete ? (
            <Link
              href="/results"
              className="flex items-center justify-center w-full rounded-full bg-accent text-white px-6 py-3.5 font-medium transition-opacity hover:opacity-90"
            >
              See your results
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-3">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Share your thoughts..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-2xl border border-border bg-surface px-5 py-3 text-[15px] leading-relaxed placeholder:text-muted/50 focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="self-end rounded-full bg-foreground text-background px-5 py-3 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-30"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
