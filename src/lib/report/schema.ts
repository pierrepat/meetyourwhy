export interface NorthStar {
  statement: string;
  ikigaiOverlaps: string[];
  alternatives: string[];
}

export interface HiddenThreadStory {
  quote: string;
  summary: string;
  connectionToThread: string;
}

export interface HiddenThread {
  theme: string;
  stories: HiddenThreadStory[];
  explanation: string;
  alternativeInterpretation: string;
}

export interface Archetype {
  name: string;
  description: string;
  behavioralPattern: string;
  evidence: string[];
  limitations: string;
}

export interface DiscoveryReport {
  version: 1;
  northStar: NorthStar;
  hiddenThread: HiddenThread;
  archetype: Archetype;
  generatedAt: string;
}
