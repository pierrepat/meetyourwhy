import { describe, it, expect } from "vitest";
import { extractJson } from "./parse";

describe("extractJson", () => {
  const validJson = JSON.stringify({
    question: "What do you love doing?",
    strategy: "explore",
    isMirrorMoment: false,
    profileUpdates: {
      ikigai: { love: [{ quote: "I love painting", story: "Paints daily", strength: 2, questionNumber: 1 }] },
    },
    shouldEnd: false,
  });

  it("parses raw JSON", () => {
    const result = extractJson(validJson);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What do you love doing?");
    expect(result!.strategy).toBe("explore");
  });

  it("parses JSON in a closed code block", () => {
    const text = "```json\n" + validJson + "\n```";
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What do you love doing?");
  });

  it("parses JSON in a closed code block without json tag", () => {
    const text = "```\n" + validJson + "\n```";
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What do you love doing?");
  });

  it("parses JSON in an unclosed code block", () => {
    const text = "Some conversational text here.\n\n```json\n" + validJson;
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What do you love doing?");
  });

  it("parses conversational text followed by unclosed code block", () => {
    const text =
      "That's a beautiful story about your daughter.\n\n```json\n" +
      JSON.stringify(
        { question: "Tell me more about that moment.", strategy: "deepen", shouldEnd: false },
        null,
        2
      );
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("Tell me more about that moment.");
    expect(result!.strategy).toBe("deepen");
  });

  it("parses JSON embedded in text without code fences", () => {
    const json = JSON.stringify({
      question: "What drives you?",
      strategy: "explore",
      shouldEnd: false,
    });
    const text = "Here is my response:\n" + json;
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What drives you?");
  });

  it("parses pretty-printed JSON in text", () => {
    const json = JSON.stringify(
      { question: "What scares you?", strategy: "harder", shouldEnd: false },
      null,
      2
    );
    const text = "Acknowledgment line.\n\n" + json;
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe("What scares you?");
  });

  it("returns null for plain text with no JSON", () => {
    const result = extractJson("Just some conversational text with no JSON at all.");
    expect(result).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractJson("")).toBeNull();
  });

  it("returns null for JSON without a question field", () => {
    const result = extractJson(JSON.stringify({ answer: "hello", strategy: "explore" }));
    expect(result).toBeNull();
  });

  it("extracts profileUpdates correctly", () => {
    const result = extractJson(validJson);
    expect(result).not.toBeNull();
    const updates = result!.profileUpdates as Record<string, unknown>;
    const ikigai = updates.ikigai as Record<string, unknown>;
    const love = ikigai.love as Array<Record<string, unknown>>;
    expect(love).toHaveLength(1);
    expect(love[0].quote).toBe("I love painting");
  });

  it("handles the real-world failure case: conversational text + unclosed pretty JSON", () => {
    const text =
      'Three weekends of sanding, and her fingers on the edge was the payoff. ' +
      'Did you have something you loved making as a kid, before any of this?\n\n' +
      '```json\n' +
      '{\n' +
      '  "question": "Did you have something you loved making as a kid, before any of this?",\n' +
      '  "strategy": "explore",\n' +
      '  "isMirrorMoment": false,\n' +
      '  "profileUpdates": {\n' +
      '    "ikigai": {\n' +
      '      "love": [{\n' +
      '        "quote": "Dad this is so smooth!",\n' +
      '        "story": "Built a bookshelf",\n' +
      '        "strength": 3,\n' +
      '        "questionNumber": 3\n' +
      '      }]\n' +
      '    },\n' +
      '    "coverageGaps": ["goodAt", "worldNeeds", "paidFor"],\n' +
      '    "safetyFlag": false\n' +
      '  },\n' +
      '  "shouldEnd": false\n' +
      '}';
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.question).toBe(
      "Did you have something you loved making as a kid, before any of this?"
    );
    expect(result!.shouldEnd).toBe(false);
    const updates = result!.profileUpdates as Record<string, unknown>;
    const ikigai = updates.ikigai as Record<string, unknown>;
    const love = ikigai.love as Array<Record<string, unknown>>;
    expect(love[0].quote).toBe("Dad this is so smooth!");
  });
});
