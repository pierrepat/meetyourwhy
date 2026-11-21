export interface CrisisResource {
  name: string;
  contact: string;
  description: string;
  url: string;
  source: string;
  lastVerified: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "988 Suicide & Crisis Lifeline",
    contact: "Call or text 988",
    description: "Free, confidential support for people in distress, 24/7.",
    url: "https://988lifeline.org",
    source: "SAMHSA / U.S. Department of Health and Human Services",
    lastVerified: "2026-11-21",
  },
  {
    name: "Crisis Text Line",
    contact: "Text HOME to 741741",
    description: "Free crisis counseling via text message, 24/7.",
    url: "https://www.crisistextline.org",
    source: "Crisis Text Line, Inc.",
    lastVerified: "2026-11-21",
  },
  {
    name: "Find a Helpline",
    contact: "findahelpline.com",
    description: "Find crisis support in your country.",
    url: "https://findahelpline.com",
    source: "Find A Helpline (international directory)",
    lastVerified: "2026-11-21",
  },
];

export const DISTRESS_SIGNALS = [
  "want to die",
  "kill myself",
  "suicide",
  "self-harm",
  "self harm",
  "hurt myself",
  "end my life",
  "end it all",
  "not worth living",
  "better off dead",
  "don't want to be here",
  "can't go on",
  "no reason to live",
];

export function detectDistress(text: string): boolean {
  const lower = text.toLowerCase();
  return DISTRESS_SIGNALS.some((signal) => lower.includes(signal));
}
