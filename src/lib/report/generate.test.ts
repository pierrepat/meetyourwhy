import { describe, it, expect } from "vitest";
import { parseReportResponse, buildReportPrompt } from "./generate";
import { createEmptyProfile } from "@/lib/interview/profile";

const validReport = {
  northStar: {
    statement: "You help people see what they can't see",
    ikigaiOverlaps: ["love + goodAt"],
    alternatives: ["Alt 1", "Alt 2"],
  },
  hiddenThread: {
    theme: "Making the invisible visible",
    stories: [
      {
        quote: "I love connecting dots",
        summary: "Built systems in college",
        connectionToThread: "Pattern recognition at work",
      },
    ],
    explanation: "These stories share a thread.",
    alternativeInterpretation: "Could also be about control.",
  },
  archetype: {
    name: "The Bridge Builder",
    description: "You connect people and ideas.",
    behavioralPattern: "When messy situations arise, you step in.",
    evidence: ["Quote 1", "Quote 2"],
    limitations: "May spread too thin.",
  },
};

describe("parseReportResponse", () => {
  it("parses raw JSON", () => {
    const result = parseReportResponse(JSON.stringify(validReport));
    expect(result).not.toBeNull();
    expect(result!.northStar.statement).toBe(
      "You help people see what they can't see"
    );
    expect(result!.version).toBe(1);
    expect(result!.generatedAt).toBeTruthy();
  });

  it("parses JSON in a closed code block", () => {
    const text = `Here is the report:\n\`\`\`json\n${JSON.stringify(validReport, null, 2)}\n\`\`\``;
    const result = parseReportResponse(text);
    expect(result).not.toBeNull();
    expect(result!.archetype.name).toBe("The Bridge Builder");
  });

  it("parses JSON in an unclosed code block", () => {
    const text = `\`\`\`json\n${JSON.stringify(validReport, null, 2)}`;
    const result = parseReportResponse(text);
    expect(result).not.toBeNull();
    expect(result!.hiddenThread.theme).toBe("Making the invisible visible");
  });

  it("parses embedded JSON with surrounding text", () => {
    const text = `I've analyzed your stories and here are your results:\n\n${JSON.stringify(validReport, null, 2)}\n\nI hope these resonate with you.`;
    const result = parseReportResponse(text);
    expect(result).not.toBeNull();
    expect(result!.northStar.alternatives).toHaveLength(2);
  });

  it("returns null for invalid JSON", () => {
    expect(parseReportResponse("not json at all")).toBeNull();
  });

  it("returns null for JSON without northStar key", () => {
    expect(parseReportResponse('{"something": "else"}')).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseReportResponse("")).toBeNull();
  });

  it("wraps with version and timestamp", () => {
    const result = parseReportResponse(JSON.stringify(validReport));
    expect(result!.version).toBe(1);
    expect(typeof result!.generatedAt).toBe("string");
    expect(new Date(result!.generatedAt).getTime()).not.toBeNaN();
  });

  it("preserves all Hidden Thread stories", () => {
    const multiStory = {
      ...validReport,
      hiddenThread: {
        ...validReport.hiddenThread,
        stories: [
          { quote: "Q1", summary: "S1", connectionToThread: "C1" },
          { quote: "Q2", summary: "S2", connectionToThread: "C2" },
          { quote: "Q3", summary: "S3", connectionToThread: "C3" },
        ],
      },
    };
    const result = parseReportResponse(JSON.stringify(multiStory));
    expect(result!.hiddenThread.stories).toHaveLength(3);
  });

  it("preserves archetype evidence array", () => {
    const result = parseReportResponse(JSON.stringify(validReport));
    expect(result!.archetype.evidence).toEqual(["Quote 1", "Quote 2"]);
  });
});

describe("buildReportPrompt", () => {
  it("includes the profile data", () => {
    const profile = createEmptyProfile();
    const prompt = buildReportPrompt(profile);
    expect(prompt).toContain("ikigai");
    expect(prompt).toContain("tendencies");
  });

  it("includes instructions for all three sections", () => {
    const profile = createEmptyProfile();
    const prompt = buildReportPrompt(profile);
    expect(prompt).toContain("North Star");
    expect(prompt).toContain("Hidden Thread");
    expect(prompt).toContain("Archetype");
  });

  it("includes rules about not inventing quotes", () => {
    const profile = createEmptyProfile();
    const prompt = buildReportPrompt(profile);
    expect(prompt).toContain("ONLY use quotes");
    expect(prompt).toContain("Never invent");
  });

  it("requests JSON response format", () => {
    const profile = createEmptyProfile();
    const prompt = buildReportPrompt(profile);
    expect(prompt).toContain("valid JSON");
    expect(prompt).toContain('"northStar"');
  });
});
