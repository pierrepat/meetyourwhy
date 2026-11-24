"use client";

import { useEffect } from "react";
import { captureUtmParams } from "@/lib/analytics/utm";
import { trackPixelEvent } from "@/lib/analytics/meta-pixel";
import { trackEvent } from "@/lib/analytics/posthog";

export function LandingTracking() {
  useEffect(() => {
    const utm = captureUtmParams();
    trackPixelEvent("landing_view");
    trackEvent("landing_view", utm || undefined);
  }, []);
  return null;
}
