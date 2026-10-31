import type { DifficultyLevel } from "@/lib/game/difficulty";

export interface GameBot {
  level: DifficultyLevel;
  name: string;
  price: number;
  avatar: string;
  itemId?: string;
  glyphSetId: "emoji" | "numeric" | "runes" | "zodiac" | "galaxies";
}

export const GAME_BOTS: GameBot[] = [
  { level: 1, name: "Spark", price: 0, glyphSetId: "emoji", avatar: "/game/bots/spark.svg" },
  { level: 2, name: "Byte", price: 50, glyphSetId: "numeric", avatar: "/game/bots/byte.svg", itemId: "bot-byte" },
  { level: 3, name: "Nexus", price: 125, glyphSetId: "runes", avatar: "/game/bots/nexus.svg", itemId: "bot-nexus" },
  { level: 4, name: "Oracle", price: 250, glyphSetId: "zodiac", avatar: "/game/bots/oracle.svg", itemId: "bot-oracle" },
  { level: 5, name: "Singularity", price: 500, glyphSetId: "galaxies", avatar: "/game/bots/singularity.svg", itemId: "bot-singularity" },
];

export function getBotForLevel(level: number) {
  return GAME_BOTS.find((bot) => bot.level === level);
}
