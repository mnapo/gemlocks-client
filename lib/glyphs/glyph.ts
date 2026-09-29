export type GlyphId = string;

export type Glyph = {
  id: GlyphId;
  value: string;
  label: string;
  kind: "digit" | "emoji" | "rune" | "zodiac" | "symbol";
};

export type GlyphSet = {
  id: string;
  name: string;
  glyphs: Glyph[];
};
