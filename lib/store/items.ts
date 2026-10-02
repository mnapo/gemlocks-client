export type StoreSectionId = "glifos" | "temas" | "avatares";

export type StoreItem = {
  id: string;
  name: string;
  price: number;
  preview?: string;
};

export const STORE_SECTIONS: Record<StoreSectionId, { title: string; subtitle: string; items: StoreItem[] }> = {
  glifos: {
    title: "Glifos",
    subtitle: "Nuevos símbolos más variados para construir tu código",
    items: [
      { id: "glyphs-emoji", name: "Emojis", price: 10, preview: "😀 😎 🤖 👻" },
      { id: "glyphs-zodiac", name: "Zodíaco", price: 20, preview: "♈ ♉ ♊ ♋" },
      { id: "glyphs-runes", name: "Runas", price: 35, preview: "ᚠ ᚢ ᚦ ᚨ" },
    ],
  },
  temas: {
    title: "Temas",
    subtitle: "Modificá la estética de todo el juego",
    items: [
      { id: "theme-light", name: "Light", price: 5 },
      { id: "theme-pink", name: "Pink", price: 5 },
      { id: "theme-ocean", name: "Ocean", price: 5 },
    ],
  },
  avatares: {
    title: "Avatares",
    subtitle: "Un ícono que te represente en tu cuenta",
    items: [
      { id: "avatar-pelota", name: "Pelota", price: 15 },
      { id: "avatar-flores", name: "Flores", price: 15 },
      { id: "avatar-guitarra", name: "Guitarra", price: 15 },
      { id: "avatar-paisaje", name: "Paisaje", price: 15 },
      { id: "avatar-robot", name: "Robot", price: 15 },
      { id: "avatar-elfo", name: "Elfo", price: 15 },
      { id: "avatar-elfa", name: "Elfa", price: 15 },
      { id: "avatar-doctor", name: "Doctor", price: 15 },
      { id: "avatar-doctora", name: "Doctora", price: 15 },
      { id: "avatar-mago", name: "Mago", price: 15 },
      { id: "avatar-maga", name: "Maga", price: 15 },
    ],
  },
};
