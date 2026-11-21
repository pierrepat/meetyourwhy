// --- Ikigai ---

export interface IkigaiEntry {
  quote: string;
  story: string;
  strength: number; // 1-3
  questionNumber: number;
}

export interface IkigaiOverlap {
  circles: string[];
  evidence: string;
}

export interface Ikigai {
  love: IkigaiEntry[];
  goodAt: IkigaiEntry[];
  worldNeeds: IkigaiEntry[];
  paidFor: IkigaiEntry[];
  overlaps: IkigaiOverlap[];
}

// --- Personality tendencies ---

export type TendencyLean =
  | "inward"
  | "outward"
  | "concrete"
  | "patterns"
  | "logic"
  | "values"
  | "planned"
  | "flexible"
  | "unclear";

export interface Tendency {
  lean: TendencyLean;
  confidence: number; // 0-1
  evidence: string[];
}

export interface Tendencies {
  energy: Tendency;
  information: Tendency;
  decisions: Tendency;
  structure: Tendency;
}

// --- Core drive / fear ---

export interface DriveOrFear {
  candidate: string;
  confidence: number; // 0-1
  evidence: string[];
}

// --- Natural role ---

export interface NaturalRole {
  candidate: string;
  evidence: string[];
}

// --- Tension ---

export interface ProfileTension {
  candidate: string;
  evidence: string[];
}

// --- Mirror moments ---

export interface MirrorMoment {
  questionNumber: number;
  reflection: string;
  response: "confirmed" | "corrected" | "rejected";
  correction?: string;
}

// --- Full profile ---

export interface Profile {
  ikigai: Ikigai;
  tendencies: Tendencies;
  coreDrive: DriveOrFear | null;
  coreFear: DriveOrFear | null;
  naturalRole: NaturalRole | null;
  tension: ProfileTension | null;
  mirrorMoments: MirrorMoment[];
  coverageGaps: string[];
  safetyFlag: boolean;
}

function emptyTendency(): Tendency {
  return { lean: "unclear", confidence: 0, evidence: [] };
}

export function createEmptyProfile(): Profile {
  return {
    ikigai: {
      love: [],
      goodAt: [],
      worldNeeds: [],
      paidFor: [],
      overlaps: [],
    },
    tendencies: {
      energy: emptyTendency(),
      information: emptyTendency(),
      decisions: emptyTendency(),
      structure: emptyTendency(),
    },
    coreDrive: null,
    coreFear: null,
    naturalRole: null,
    tension: null,
    mirrorMoments: [],
    coverageGaps: ["love", "goodAt", "worldNeeds", "paidFor"],
    safetyFlag: false,
  };
}

export function getInterviewPhase(questionCount: number): string {
  if (questionCount <= 1) return "Getting started";
  if (questionCount <= 5) return "Stories of aliveness";
  if (questionCount <= 9) return "Strengths & contribution";
  if (questionCount <= 12) return "Going deeper";
  return "Putting it together";
}

export function getInterviewProgress(questionCount: number): number {
  return Math.min(Math.round((questionCount / 15) * 100), 100);
}

export function getCoverageScore(profile: Profile): number {
  let filled = 0;
  if (profile.ikigai.love.length > 0) filled++;
  if (profile.ikigai.goodAt.length > 0) filled++;
  if (profile.ikigai.worldNeeds.length > 0) filled++;
  if (profile.ikigai.paidFor.length > 0) filled++;

  const tendencyCount = (
    ["energy", "information", "decisions", "structure"] as const
  ).filter((k) => profile.tendencies[k].confidence > 0.5).length;

  return (filled + tendencyCount) / 8;
}
