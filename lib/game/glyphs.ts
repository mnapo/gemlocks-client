export type GlyphSetId = "numeric" | "emoji" | "runes" | "zodiac";

export interface GlyphDefinition {
  id: string;
  label: string;
  value?: string;
  asset?: string;
}

export interface GlyphSet {
  id: GlyphSetId;
  name: string;
  glyphs: readonly GlyphDefinition[];
}

export const DEFAULT_GLYPH_SET_ID: GlyphSetId = "numeric";

export const GLYPH_SETS: Record<GlyphSetId, GlyphSet> = {
  numeric: {
    id: "numeric",
    name: "Numérico",
    glyphs: Array.from({ length: 10 }, (_, index) => ({
      id: `numeric-${index}`,
      label: String(index),
      value: String(index),
    })),
  },
  emoji: {
    id: "emoji",
    name: "Emojis",
    glyphs: [
      { id: "emoji-grinning", label: "Sonriente", value: "😀" },
      { id: "emoji-sunglasses", label: "Anteojos de sol", value: "😎" },
      { id: "emoji-robot", label: "Robot", value: "🤖" },
      { id: "emoji-ghost", label: "Fantasma", value: "👻" },
      { id: "emoji-fox", label: "Zorro", value: "🦊" },
      { id: "emoji-dragon", label: "Dragón", value: "🐉" },
      { id: "emoji-rocket", label: "Cohete", value: "🚀" },
      { id: "emoji-lightning", label: "Rayo", value: "⚡" },
      { id: "emoji-fire", label: "Fuego", value: "🔥" },
      { id: "emoji-moon", label: "Luna", value: "🌙" },
    ],
  },
  runes: {
    id: "runes",
    name: "Runas",
    glyphs: [
      { id: "rune-fehu", label: "Fehu", value: "ᚠ", asset: "/glyphs/runes.svg#rune-fehu" },
      { id: "rune-uruz", label: "Uruz", value: "ᚢ", asset: "/glyphs/runes.svg#rune-uruz" },
      { id: "rune-thurisaz", label: "Thurisaz", value: "ᚦ", asset: "/glyphs/runes.svg#rune-thurisaz" },
      { id: "rune-ansuz", label: "Ansuz", value: "ᚨ", asset: "/glyphs/runes.svg#rune-ansuz" },
      { id: "rune-raidho", label: "Raidho", value: "ᚱ", asset: "/glyphs/runes.svg#rune-raidho" },
      { id: "rune-kenaz", label: "Kenaz", value: "ᚲ", asset: "/glyphs/runes.svg#rune-kenaz" },
      { id: "rune-gebo", label: "Gebo", value: "ᚷ", asset: "/glyphs/runes.svg#rune-gebo" },
      { id: "rune-wunjo", label: "Wunjo", value: "ᚹ", asset: "/glyphs/runes.svg#rune-wunjo" },
      { id: "rune-hagalaz", label: "Hagalaz", value: "ᚺ", asset: "/glyphs/runes.svg#rune-hagalaz" },
      { id: "rune-nauthiz", label: "Nauthiz", value: "ᚾ", asset: "/glyphs/runes.svg#rune-nauthiz" },
    ],
  },
  zodiac: {
    id: "zodiac",
    name: "Signos del zodíaco",
    glyphs: [
      { id: "zodiac-aries", label: "Aries", value: "♈" },
      { id: "zodiac-taurus", label: "Tauro", value: "♉" },
      { id: "zodiac-gemini", label: "Géminis", value: "♊" },
      { id: "zodiac-cancer", label: "Cáncer", value: "♋" },
      { id: "zodiac-leo", label: "Leo", value: "♌" },
      { id: "zodiac-virgo", label: "Virgo", value: "♍" },
      { id: "zodiac-libra", label: "Libra", value: "♎" },
      { id: "zodiac-scorpio", label: "Escorpio", value: "♏" },
      { id: "zodiac-sagittarius", label: "Sagitario", value: "♐" },
      { id: "zodiac-capricorn", label: "Capricornio", value: "♑" },
    ],
  },
};

export function getGlyphSet(id: GlyphSetId): GlyphSet {
  return GLYPH_SETS[id];
}
