function tryParse(str: string): Record<string, unknown> | null {
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === "object" && "question" in obj) return obj;
    return null;
  } catch {
    return null;
  }
}

export function extractJson(text: string): Record<string, unknown> | null {
  // Try 1: Entire text is valid JSON
  const direct = tryParse(text.trim());
  if (direct) return direct;

  // Try 2: JSON in a closed code block (```json ... ```)
  const closedBlock = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
  if (closedBlock) {
    const result = tryParse(closedBlock[1].trim());
    if (result) return result;
  }

  // Try 3: JSON in an unclosed code block (AI forgot closing ```)
  const unclosedBlock = text.match(/```(?:json)?\s*\n([\s\S]+)$/);
  if (unclosedBlock) {
    const result = tryParse(unclosedBlock[1].trim());
    if (result) return result;
  }

  // Try 4: Find a JSON object containing "question" by brace-matching
  const jsonStart = text.search(/\{\s*\n?\s*"question"/);
  if (jsonStart >= 0) {
    let depth = 0;
    for (let i = jsonStart; i < text.length; i++) {
      if (text[i] === "{") depth++;
      else if (text[i] === "}") depth--;
      if (depth === 0) {
        const result = tryParse(text.slice(jsonStart, i + 1));
        if (result) return result;
        break;
      }
    }
  }

  return null;
}
