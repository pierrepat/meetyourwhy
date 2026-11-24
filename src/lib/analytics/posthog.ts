"use client";

import posthog from "posthog-js";

let initialized = false;

export function initPostHog() {
  if (initialized) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
  if (!key || typeof window === "undefined") return;

  posthog.init(key, {
    api_host: host || "https://us.i.posthog.com",
    capture_pageview: false,
    capture_pageleave: true,
    persistence: "sessionStorage",
  });
  initialized = true;
}

export function trackEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  if (!initialized || typeof window === "undefined") return;
  posthog.capture(event, properties);
}

export { posthog };
