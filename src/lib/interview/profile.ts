export interface DimensionState {
  confidence: number;
  notes: string;
  evidence: string[];
}

export interface Profile {
  ikigai: {
    love: DimensionState;
    skill: DimensionState;
    need: DimensionState;
    paid: DimensionState;
  };
  personality16: DimensionState;
  bigFive: {
    openness: DimensionState;
    conscientiousness: DimensionState;
    extraversion: DimensionState;
    agreeableness: DimensionState;
    neuroticism: DimensionState;
  };
  enneagram: DimensionState;
  viaStrengths: DimensionState;
  schwartzValues: DimensionState;
  hollandRIASEC: DimensionState;
  lifeStory: DimensionState;
}

const emptyDimension = (): DimensionState => ({
  confidence: 0,
  notes: "",
  evidence: [],
});

export function createEmptyProfile(): Profile {
  return {
    ikigai: {
      love: emptyDimension(),
      skill: emptyDimension(),
      need: emptyDimension(),
      paid: emptyDimension(),
    },
    personality16: emptyDimension(),
    bigFive: {
      openness: emptyDimension(),
      conscientiousness: emptyDimension(),
      extraversion: emptyDimension(),
      agreeableness: emptyDimension(),
      neuroticism: emptyDimension(),
    },
    enneagram: emptyDimension(),
    viaStrengths: emptyDimension(),
    schwartzValues: emptyDimension(),
    hollandRIASEC: emptyDimension(),
    lifeStory: emptyDimension(),
  };
}

export function getOverallConfidence(profile: Profile): number {
  const dimensions = [
    profile.ikigai.love,
    profile.ikigai.skill,
    profile.ikigai.need,
    profile.ikigai.paid,
    profile.personality16,
    profile.bigFive.openness,
    profile.bigFive.conscientiousness,
    profile.bigFive.extraversion,
    profile.bigFive.agreeableness,
    profile.bigFive.neuroticism,
    profile.enneagram,
    profile.viaStrengths,
    profile.schwartzValues,
    profile.hollandRIASEC,
    profile.lifeStory,
  ];
  return dimensions.reduce((sum, d) => sum + d.confidence, 0) / dimensions.length;
}

export function getWeakestDimensions(profile: Profile): string[] {
  const all: { name: string; confidence: number }[] = [
    { name: "ikigai.love", confidence: profile.ikigai.love.confidence },
    { name: "ikigai.skill", confidence: profile.ikigai.skill.confidence },
    { name: "ikigai.need", confidence: profile.ikigai.need.confidence },
    { name: "ikigai.paid", confidence: profile.ikigai.paid.confidence },
    { name: "personality16", confidence: profile.personality16.confidence },
    { name: "bigFive.openness", confidence: profile.bigFive.openness.confidence },
    { name: "bigFive.conscientiousness", confidence: profile.bigFive.conscientiousness.confidence },
    { name: "bigFive.extraversion", confidence: profile.bigFive.extraversion.confidence },
    { name: "bigFive.agreeableness", confidence: profile.bigFive.agreeableness.confidence },
    { name: "bigFive.neuroticism", confidence: profile.bigFive.neuroticism.confidence },
    { name: "enneagram", confidence: profile.enneagram.confidence },
    { name: "viaStrengths", confidence: profile.viaStrengths.confidence },
    { name: "schwartzValues", confidence: profile.schwartzValues.confidence },
    { name: "hollandRIASEC", confidence: profile.hollandRIASEC.confidence },
    { name: "lifeStory", confidence: profile.lifeStory.confidence },
  ];
  all.sort((a, b) => a.confidence - b.confidence);
  return all.slice(0, 3).map((d) => d.name);
}

export const CONFIDENCE_THRESHOLD = 0.6;
export const INTERVIEW_DURATION_MS = 15 * 60 * 1000;
