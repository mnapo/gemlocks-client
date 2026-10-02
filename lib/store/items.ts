export type StoreSectionId = "glifos" | "temas" | "avatares";

export type StoreItem = {
  id: string;
  name: string;
  price: number;
  preview?: string;
  image?: string;
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
      { id: "theme-light", name: "Light", price: 5, preview: "theme-light" },
      { id: "theme-pink", name: "Pink", price: 5, preview: "theme-pink" },
      { id: "theme-ocean", name: "Ocean", price: 5, preview: "theme-ocean" },
    ],
  },
  avatares: {
    title: "Avatares",
    subtitle: "Un ícono que te represente en tu cuenta",
    items: [
      { id: "avatar-pelota", name: "Pelota", price: 15, image: "/store/avatars/pelota.svg" },
      { id: "avatar-flores", name: "Flores", price: 15, image: "/store/avatars/flores.svg" },
      { id: "avatar-guitarra", name: "Guitarra", price: 15, image: "/store/avatars/guitarra.svg" },
      { id: "avatar-paisaje", name: "Paisaje", price: 15, image: "/store/avatars/paisaje.svg" },
      { id: "avatar-robot", name: "Robot", price: 15, image: "/store/avatars/robot.svg" },
      { id: "avatar-elfo", name: "Elfo", price: 15, image: "/store/avatars/elfo.svg" },
      { id: "avatar-elfa", name: "Elfa", price: 15, image: "/store/avatars/elfa.svg" },
      { id: "avatar-doctor", name: "Doctor", price: 15, image: "/store/avatars/doctor.svg" },
      { id: "avatar-doctora", name: "Doctora", price: 15, image: "/store/avatars/doctora.svg" },
      { id: "avatar-mago", name: "Mago", price: 15, image: "/store/avatars/mago.svg" },
      { id: "avatar-maga", name: "Maga", price: 15, image: "/store/avatars/maga.svg" },
    ],
  },
};
