const CARD_W = 1080;
const CARD_H = 1920;

const COLORS = {
  bg: "#FAF7F2",
  fg: "#2D2A26",
  muted: "#8A8580",
  accent: "#B8860B",
  accentLight: "#D4A843",
  border: "#E8E2DA",
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export async function generateStoryCard(
  northStar: string,
  archetype: string,
  hiddenThreadTheme: string
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  // Top accent line
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(80, 160, 60, 4);

  // "MY NORTH STAR" label
  ctx.fillStyle = COLORS.muted;
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("MY NORTH STAR", 80, 230);
  ctx.letterSpacing = "0px";

  // North Star statement
  ctx.fillStyle = COLORS.fg;
  ctx.font = "700 56px Georgia, 'Times New Roman', serif";
  const nsLines = wrapText(ctx, northStar, CARD_W - 160);
  let y = 320;
  for (const line of nsLines) {
    ctx.fillText(line, 80, y);
    y += 72;
  }

  // Divider
  y += 40;
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(80, y, CARD_W - 160, 1);
  y += 60;

  // Hidden Thread theme
  ctx.fillStyle = COLORS.muted;
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("MY HIDDEN THREAD", 80, y);
  ctx.letterSpacing = "0px";
  y += 50;

  ctx.fillStyle = COLORS.fg;
  ctx.font = "italic 40px Georgia, 'Times New Roman', serif";
  const htLines = wrapText(ctx, hiddenThreadTheme, CARD_W - 160);
  for (const line of htLines) {
    ctx.fillText(line, 80, y);
    y += 54;
  }

  // Divider
  y += 40;
  ctx.fillStyle = COLORS.border;
  ctx.fillRect(80, y, CARD_W - 160, 1);
  y += 60;

  // Archetype
  ctx.fillStyle = COLORS.muted;
  ctx.font = "500 28px system-ui, -apple-system, sans-serif";
  ctx.letterSpacing = "8px";
  ctx.fillText("MY ARCHETYPE", 80, y);
  ctx.letterSpacing = "0px";
  y += 50;

  ctx.fillStyle = COLORS.fg;
  ctx.font = "700 64px Georgia, 'Times New Roman', serif";
  const archLines = wrapText(ctx, archetype, CARD_W - 160);
  for (const line of archLines) {
    ctx.fillText(line, 80, y);
    y += 80;
  }

  // Bottom section
  const bottomY = CARD_H - 200;

  // Accent line
  ctx.fillStyle = COLORS.accent;
  ctx.fillRect(80, bottomY, 60, 4);

  // CTA
  ctx.fillStyle = COLORS.fg;
  ctx.font = "600 36px system-ui, -apple-system, sans-serif";
  ctx.fillText("Discover what makes you, you.", 80, bottomY + 60);

  ctx.fillStyle = COLORS.muted;
  ctx.font = "400 30px system-ui, -apple-system, sans-serif";
  ctx.fillText("meetyourwhy.com", 80, bottomY + 110);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/png",
      1
    );
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
