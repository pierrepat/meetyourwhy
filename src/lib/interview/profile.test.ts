import { describe, it, expect } from "vitest";
import {
  createEmptyProfile,
  getInterviewPhase,
  getInterviewProgress,
  getCoverageScore,
  Profile,
} from "./profile";

describe("createEmptyProfile", () => {
  it("initializes all Ikigai arrays as empty", () => {
    const p = createEmptyProfile();
    expect(p.ikigai.love).toEqual([]);
    expect(p.ikigai.goodAt).toEqual([]);
    expect(p.ikigai.worldNeeds).toEqual([]);
    expect(p.ikigai.paidFor).toEqual([]);
    expect(p.ikigai.overlaps).toEqual([]);
  });

  it("initializes tendencies as unclear with zero confidence", () => {
    const p = createEmptyProfile();
    for (const dim of ["energy", "information", "decisions", "structure"] as const) {
      expect(p.tendencies[dim].lean).toBe("unclear");
      expect(p.tendencies[dim].confidence).toBe(0);
      expect(p.tendencies[dim].evidence).toEqual([]);
    }
  });

  it("initializes drives, role, and tension as null", () => {
    const p = createEmptyProfile();
    expect(p.coreDrive).toBeNull();
    expect(p.coreFear).toBeNull();
    expect(p.naturalRole).toBeNull();
    expect(p.tension).toBeNull();
  });

  it("initializes coverage gaps with all four Ikigai circles", () => {
    const p = createEmptyProfile();
    expect(p.coverageGaps).toEqual(["love", "goodAt", "worldNeeds", "paidFor"]);
  });

  it("initializes safety flag as false", () => {
    const p = createEmptyProfile();
    expect(p.safetyFlag).toBe(false);
  });
});

describe("getInterviewPhase", () => {
  it("returns 'Getting started' for Q0-1", () => {
    expect(getInterviewPhase(0)).toBe("Getting started");
    expect(getInterviewPhase(1)).toBe("Getting started");
  });

  it("returns 'Stories of aliveness' for Q2-5", () => {
    expect(getInterviewPhase(2)).toBe("Stories of aliveness");
    expect(getInterviewPhase(5)).toBe("Stories of aliveness");
  });

  it("returns 'Strengths & contribution' for Q6-9", () => {
    expect(getInterviewPhase(6)).toBe("Strengths & contribution");
    expect(getInterviewPhase(9)).toBe("Strengths & contribution");
  });

  it("returns 'Going deeper' for Q10-12", () => {
    expect(getInterviewPhase(10)).toBe("Going deeper");
    expect(getInterviewPhase(12)).toBe("Going deeper");
  });

  it("returns 'Putting it together' for Q13+", () => {
    expect(getInterviewPhase(13)).toBe("Putting it together");
    expect(getInterviewPhase(20)).toBe("Putting it together");
  });
});

describe("getInterviewProgress", () => {
  it("returns 0% at start", () => {
    expect(getInterviewProgress(0)).toBe(0);
  });

  it("returns ~50% at midpoint", () => {
    expect(getInterviewProgress(7)).toBe(47);
    expect(getInterviewProgress(8)).toBe(53);
  });

  it("caps at 100%", () => {
    expect(getInterviewProgress(15)).toBe(100);
    expect(getInterviewProgress(20)).toBe(100);
  });
});

describe("getCoverageScore", () => {
  it("returns 0 for an empty profile", () => {
    const p = createEmptyProfile();
    expect(getCoverageScore(p)).toBe(0);
  });

  it("counts filled Ikigai circles", () => {
    const p = createEmptyProfile();
    p.ikigai.love.push({ quote: "test", story: "test", strength: 1, questionNumber: 1 });
    p.ikigai.goodAt.push({ quote: "test", story: "test", strength: 1, questionNumber: 2 });
    expect(getCoverageScore(p)).toBe(2 / 8);
  });

  it("counts tendencies above 0.5 confidence", () => {
    const p = createEmptyProfile();
    p.tendencies.energy = { lean: "outward", confidence: 0.6, evidence: ["test"] };
    p.tendencies.information = { lean: "concrete", confidence: 0.7, evidence: ["test"] };
    p.tendencies.decisions = { lean: "values", confidence: 0.3, evidence: ["test"] };
    expect(getCoverageScore(p)).toBe(2 / 8);
  });

  it("returns 1.0 for a fully covered profile", () => {
    const p = createEmptyProfile();
    const entry = { quote: "q", story: "s", strength: 2 as const, questionNumber: 1 };
    p.ikigai.love.push(entry);
    p.ikigai.goodAt.push(entry);
    p.ikigai.worldNeeds.push(entry);
    p.ikigai.paidFor.push(entry);
    p.tendencies.energy = { lean: "outward", confidence: 0.8, evidence: ["e"] };
    p.tendencies.information = { lean: "concrete", confidence: 0.6, evidence: ["e"] };
    p.tendencies.decisions = { lean: "values", confidence: 0.9, evidence: ["e"] };
    p.tendencies.structure = { lean: "planned", confidence: 0.7, evidence: ["e"] };
    expect(getCoverageScore(p)).toBe(1);
  });
});
