export type ConfidenceLevel =
  | "insufficient"
  | "emerging"
  | "supported"
  | "confirmed"
  | "disputed";

export interface Evidence {
  quote: string;
  context: string;
  questionNumber: number;
}

export interface LifeStory {
  summary: string;
  emotions: string[];
  evidence: Evidence;
  relatedDrivers: string[];
}

export interface Insight {
  label: string;
  description: string;
  evidence: Evidence[];
  confidence: ConfidenceLevel;
}

export interface Tension {
  label: string;
  sideA: string;
  sideB: string;
  evidence: Evidence[];
}

export interface HiddenThread {
  theme: string;
  storyIndices: number[];
  hypothesis: string;
  alternativeHypothesis: string;
  confidence: ConfidenceLevel;
}

export interface MirrorMoment {
  questionNumber: number;
  reflection: string;
  response: "confirmed" | "corrected" | "rejected";
  correction?: string;
}

export interface Profile {
  lifeStories: LifeStory[];
  coreDrivers: Insight[];
  personalValues: Insight[];
  demonstratedStrengths: Insight[];
  internalTensions: Tension[];
  hiddenThread: HiddenThread | null;
  mirrorMoments: MirrorMoment[];
}

export function createEmptyProfile(): Profile {
  return {
    lifeStories: [],
    coreDrivers: [],
    personalValues: [],
    demonstratedStrengths: [],
    internalTensions: [],
    hiddenThread: null,
    mirrorMoments: [],
  };
}

export function getInterviewPhase(questionCount: number): string {
  if (questionCount <= 4) return "Getting to know you";
  if (questionCount <= 7) return "Finding patterns";
  if (questionCount <= 12) return "Going deeper";
  return "Putting it together";
}

export function getInterviewProgress(questionCount: number): number {
  return Math.min(Math.round((questionCount / 15) * 100), 100);
}

const CONFIDENCE_RANK: Record<ConfidenceLevel, number> = {
  insufficient: 0,
  emerging: 1,
  supported: 2,
  confirmed: 3,
  disputed: 1,
};

export function getProfileDepth(profile: Profile): number {
  const items = [
    ...profile.coreDrivers,
    ...profile.personalValues,
    ...profile.demonstratedStrengths,
  ];
  if (items.length === 0) return 0;
  const total = items.reduce((sum, i) => sum + CONFIDENCE_RANK[i.confidence], 0);
  const max = items.length * 3;
  return total / max;
}
