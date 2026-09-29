import type { GlyphSet } from "./glyph";

export const DIGIT_GLYPHS: GlyphSet = {
  id: "digits",
  name: "Digits",
  glyphs: Array.from({ length: 10 }, (_, value) => ({
    id: `digit-${value}`,
    value: String(value),
    label: String(value),
    kind: "digit" as const,
  })),
};
