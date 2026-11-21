import { describe, it, expect } from "vitest";
import { applyProfileUpdates, buildSystemPrompt, getOpeningQuestion, OPENING_QUESTIONS } from "./engine";
import { createEmptyProfile } from "./profile";

describe("applyProfileUpdates", () => {
  it("appends Ikigai love entries", () => {
    const profile = createEmptyProfile();
    const updates = {
      ikigai: {
        love: [{ quote: "I love woodworking", story: "Makes furniture", strength: 2, questionNumber: 1 }],
      },
    };
    const result = applyProfileUpdates(profile, updates, 1);
    expect(result.ikigai.love).toHaveLength(1);
    expect(result.ikigai.love[0].quote).toBe("I love woodworking");
  });

  it("appends multiple Ikigai circles at once", () => {
    const profile = createEmptyProfile();
    const updates = {
      ikigai: {
        love: [{ quote: "q1", story: "s1", strength: 2, questionNumber: 1 }],
        goodAt: [{ quote: "q2", story: "s2", strength: 1, questionNumber: 1 }],
      },
    };
    const result = applyProfileUpdates(profile, updates, 1);
    expect(result.ikigai.love).toHaveLength(1);
    expect(result.ikigai.goodAt).toHaveLength(1);
  });

  it("accumulates entries across multiple updates", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      ikigai: { love: [{ quote: "first", story: "s", strength: 1, questionNumber: 1 }] },
    }, 1);
    profile = applyProfileUpdates(profile, {
      ikigai: { love: [{ quote: "second", story: "s", strength: 2, questionNumber: 2 }] },
    }, 2);
    expect(profile.ikigai.love).toHaveLength(2);
    expect(profile.ikigai.love[0].quote).toBe("first");
    expect(profile.ikigai.love[1].quote).toBe("second");
  });

  it("deduplicates Ikigai overlaps by circle combination", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      ikigai: { overlaps: [{ circles: ["love", "goodAt"], evidence: "first evidence" }] },
    }, 1);
    profile = applyProfileUpdates(profile, {
      ikigai: { overlaps: [{ circles: ["goodAt", "love"], evidence: "duplicate" }] },
    }, 2);
    expect(profile.ikigai.overlaps).toHaveLength(1);
  });

  it("adds non-duplicate overlaps", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      ikigai: { overlaps: [{ circles: ["love", "goodAt"], evidence: "first" }] },
    }, 1);
    profile = applyProfileUpdates(profile, {
      ikigai: { overlaps: [{ circles: ["love", "worldNeeds"], evidence: "second" }] },
    }, 2);
    expect(profile.ikigai.overlaps).toHaveLength(2);
  });

  it("updates tendency with higher confidence", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "outward", confidence: 0.3, evidence: ["talks about groups"] },
      },
    }, 1);
    expect(profile.tendencies.energy.lean).toBe("outward");
    expect(profile.tendencies.energy.confidence).toBe(0.3);

    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "outward", confidence: 0.6, evidence: ["energized by team work"] },
      },
    }, 2);
    expect(profile.tendencies.energy.lean).toBe("outward");
    expect(profile.tendencies.energy.confidence).toBe(0.6);
    expect(profile.tendencies.energy.evidence).toHaveLength(2);
  });

  it("keeps current lean when incoming confidence is lower but appends evidence", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "outward", confidence: 0.6, evidence: ["strong signal"] },
      },
    }, 1);
    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "inward", confidence: 0.3, evidence: ["weak counter-signal"] },
      },
    }, 2);
    expect(profile.tendencies.energy.lean).toBe("outward");
    expect(profile.tendencies.energy.confidence).toBe(0.6);
    expect(profile.tendencies.energy.evidence).toContain("weak counter-signal");
  });

  it("ignores unclear tendency updates", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "outward", confidence: 0.5, evidence: ["signal"] },
      },
    }, 1);
    profile = applyProfileUpdates(profile, {
      tendencies: {
        energy: { lean: "unclear", confidence: 0, evidence: [] },
      },
    }, 2);
    expect(profile.tendencies.energy.lean).toBe("outward");
    expect(profile.tendencies.energy.confidence).toBe(0.5);
  });

  it("sets and replaces core drive", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      coreDrive: { candidate: "creating", confidence: 0.3, evidence: ["makes things"] },
    }, 1);
    expect(profile.coreDrive!.candidate).toBe("creating");

    profile = applyProfileUpdates(profile, {
      coreDrive: { candidate: "connecting people", confidence: 0.6, evidence: ["brings groups together"] },
    }, 2);
    expect(profile.coreDrive!.candidate).toBe("connecting people");
    expect(profile.coreDrive!.confidence).toBe(0.6);
  });

  it("does not replace core drive with lower confidence", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      coreDrive: { candidate: "creating", confidence: 0.7, evidence: ["strong"] },
    }, 1);
    profile = applyProfileUpdates(profile, {
      coreDrive: { candidate: "teaching", confidence: 0.3, evidence: ["weak"] },
    }, 2);
    expect(profile.coreDrive!.candidate).toBe("creating");
  });

  it("replaces coverage gaps", () => {
    let profile = createEmptyProfile();
    expect(profile.coverageGaps).toEqual(["love", "goodAt", "worldNeeds", "paidFor"]);

    profile = applyProfileUpdates(profile, {
      coverageGaps: ["goodAt", "worldNeeds", "paidFor"],
    }, 1);
    expect(profile.coverageGaps).toEqual(["goodAt", "worldNeeds", "paidFor"]);
  });

  it("sets safety flag and never clears it", () => {
    let profile = createEmptyProfile();
    expect(profile.safetyFlag).toBe(false);

    profile = applyProfileUpdates(profile, { safetyFlag: true }, 1);
    expect(profile.safetyFlag).toBe(true);

    profile = applyProfileUpdates(profile, { safetyFlag: false }, 2);
    expect(profile.safetyFlag).toBe(true);
  });

  it("sets natural role", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      naturalRole: { candidate: "the builder", evidence: ["builds things"] },
    }, 1);
    expect(profile.naturalRole!.candidate).toBe("the builder");
  });

  it("sets tension", () => {
    let profile = createEmptyProfile();
    profile = applyProfileUpdates(profile, {
      tension: { candidate: "values security but craves freedom", evidence: ["left stable job"] },
    }, 1);
    expect(profile.tension!.candidate).toBe("values security but craves freedom");
  });

  it("does not mutate the original profile", () => {
    const profile = createEmptyProfile();
    const updated = applyProfileUpdates(profile, {
      ikigai: { love: [{ quote: "test", story: "test", strength: 1, questionNumber: 1 }] },
    }, 1);
    expect(profile.ikigai.love).toHaveLength(0);
    expect(updated.ikigai.love).toHaveLength(1);
  });

  it("handles null/undefined updates gracefully", () => {
    const profile = createEmptyProfile();
    const result1 = applyProfileUpdates(profile, {}, 1);
    expect(result1.ikigai.love).toHaveLength(0);

    const result2 = applyProfileUpdates(profile, null as unknown as Record<string, unknown>, 1);
    expect(result2.ikigai.love).toHaveLength(0);
  });
});

describe("buildSystemPrompt", () => {
  it("includes the conversation phase based on question count", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 0, 0);
    expect(prompt).toContain("WARM OPEN");
  });

  it("includes aliveness phase for Q2-5", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 3, 120000);
    expect(prompt).toContain("STORIES OF ALIVENESS");
  });

  it("includes competence phase for Q6-9", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 7, 300000);
    expect(prompt).toContain("COMPETENCE & CONTRIBUTION");
  });

  it("includes harder layer phase for Q10-12", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 11, 500000);
    expect(prompt).toContain("THE HARDER LAYER");
  });

  it("includes reflection phase for Q13+", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 14, 800000);
    expect(prompt).toContain("REFLECTION & CLOSE");
  });

  it("includes coverage gaps in the prompt", () => {
    const profile = createEmptyProfile();
    profile.coverageGaps = ["worldNeeds", "paidFor"];
    const prompt = buildSystemPrompt(profile, 7, 300000);
    expect(prompt).toContain("worldNeeds");
    expect(prompt).toContain("paidFor");
  });

  it("triggers mirror moment when ikigai count >= 3 and no confirmed mirrors", () => {
    const profile = createEmptyProfile();
    profile.ikigai.love.push({ quote: "q1", story: "s1", strength: 2, questionNumber: 1 });
    profile.ikigai.goodAt.push({ quote: "q2", story: "s2", strength: 1, questionNumber: 2 });
    profile.ikigai.worldNeeds.push({ quote: "q3", story: "s3", strength: 1, questionNumber: 3 });
    const prompt = buildSystemPrompt(profile, 7, 300000);
    expect(prompt).toContain("MIRROR MOMENT");
  });

  it("does not trigger mirror moment if already confirmed", () => {
    const profile = createEmptyProfile();
    profile.ikigai.love.push({ quote: "q1", story: "s1", strength: 2, questionNumber: 1 });
    profile.ikigai.goodAt.push({ quote: "q2", story: "s2", strength: 1, questionNumber: 2 });
    profile.ikigai.worldNeeds.push({ quote: "q3", story: "s3", strength: 1, questionNumber: 3 });
    profile.mirrorMoments.push({
      questionNumber: 5,
      reflection: "You seem to love building things",
      response: "confirmed",
    });
    const prompt = buildSystemPrompt(profile, 7, 300000);
    expect(prompt).toContain("COMPETENCE & CONTRIBUTION");
    expect(prompt).not.toContain("MIRROR MOMENT");
  });

  it("includes safety protocol", () => {
    const profile = createEmptyProfile();
    const prompt = buildSystemPrompt(profile, 0, 0);
    expect(prompt).toContain("under 18");
    expect(prompt).toContain("suicide");
    expect(prompt).toContain("safetyFlag");
  });

  it("includes the profile JSON in the prompt", () => {
    const profile = createEmptyProfile();
    profile.ikigai.love.push({ quote: "test quote", story: "test story", strength: 1, questionNumber: 1 });
    const prompt = buildSystemPrompt(profile, 2, 60000);
    expect(prompt).toContain("test quote");
  });
});

describe("getOpeningQuestion", () => {
  it("returns one of the defined opening questions", () => {
    const question = getOpeningQuestion();
    expect(OPENING_QUESTIONS).toContain(question);
  });
});
