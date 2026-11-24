import { NextRequest } from "next/server";

const ipCounts = new Map<string, { count: number; resetAt: number }>();

const SESSION_MAX_QUESTIONS = 25;
const DAILY_BUDGET_REQUESTS = 500;
const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 10;

let dailyTotal = 0;
let dailyResetAt = Date.now() + 24 * 60 * 60 * 1000;

function getIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function checkRateLimit(req: NextRequest): {
  ok: boolean;
  error?: string;
} {
  const now = Date.now();
  const ip = getIp(req);

  if (now > dailyResetAt) {
    dailyTotal = 0;
    dailyResetAt = now + 24 * 60 * 60 * 1000;
  }
  if (dailyTotal >= DAILY_BUDGET_REQUESTS) {
    return {
      ok: false,
      error: "Service is at capacity. Please try again tomorrow.",
    };
  }

  const entry = ipCounts.get(ip);
  if (entry && now < entry.resetAt) {
    if (entry.count >= MAX_PER_WINDOW) {
      return { ok: false, error: "Too many requests. Please slow down." };
    }
    entry.count++;
  } else {
    ipCounts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
  }

  dailyTotal++;
  return { ok: true };
}

export function checkSessionLimit(questionCount: number): {
  ok: boolean;
  error?: string;
} {
  if (questionCount > SESSION_MAX_QUESTIONS) {
    return { ok: false, error: "Session question limit reached." };
  }
  return { ok: true };
}

// Periodic cleanup to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipCounts) {
      if (now > entry.resetAt) ipCounts.delete(ip);
    }
  }, 60_000);
}
