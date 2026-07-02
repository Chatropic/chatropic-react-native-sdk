/** Parse CSS linear-gradient strings from dashboard accentGradient config. */
export interface ParsedGradient {
  colors: string[];
  locations: number[];
  start: { x: number; y: number };
  end: { x: number; y: number };
}

const COLOR_STOP_RE =
  /(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\s*(\d+(?:\.\d+)?%)?/g;

function angleToPoints(deg: number): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  const rad = ((deg - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  return {
    start: { x: 0.5 - x * 0.5, y: 0.5 - y * 0.5 },
    end: { x: 0.5 + x * 0.5, y: 0.5 + y * 0.5 },
  };
}

export function parseLinearGradient(css: string): ParsedGradient | null {
  const trimmed = css.trim();
  const match = trimmed.match(/^linear-gradient\((.+)\)$/i);
  if (!match) return null;

  const parts = match[1].split(",").map((p) => p.trim());
  let angleDeg = 180;
  let startIndex = 0;

  const angleMatch = parts[0].match(/^(-?\d+(?:\.\d+)?)(deg|turn|rad)?$/);
  if (angleMatch) {
    const value = Number(angleMatch[1]);
    const unit = angleMatch[2] ?? "deg";
    if (unit === "turn") angleDeg = value * 360;
    else if (unit === "rad") angleDeg = (value * 180) / Math.PI;
    else angleDeg = value;
    startIndex = 1;
  } else if (parts[0].startsWith("to ")) {
    const direction = parts[0].slice(3).trim();
    const map: Record<string, number> = {
      top: 0,
      bottom: 180,
      left: 270,
      right: 90,
      "top right": 45,
      "right top": 45,
      "bottom right": 135,
      "right bottom": 135,
      "bottom left": 225,
      "left bottom": 225,
      "top left": 315,
      "left top": 315,
    };
    angleDeg = map[direction] ?? 180;
    startIndex = 1;
  }

  const stopText = parts.slice(startIndex).join(", ");
  const colors: string[] = [];
  const locations: number[] = [];

  for (const stop of stopText.match(COLOR_STOP_RE) ?? []) {
    const row = stop.match(
      /^(#[0-9A-Fa-f]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))\s*(\d+(?:\.\d+)?%)?$/,
    );
    if (!row) continue;
    colors.push(row[1]);
    locations.push(row[2] ? parseFloat(row[2]) / 100 : colors.length === 1 ? 0 : 1);
  }

  if (colors.length < 2) return null;

  if (locations.some((v) => Number.isNaN(v))) {
    return {
      colors,
      locations: colors.map((_, i) => i / (colors.length - 1)),
      ...angleToPoints(angleDeg),
    };
  }

  return {
    colors,
    locations,
    ...angleToPoints(angleDeg),
  };
}
