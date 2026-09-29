export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export interface DifficultyConfig {
  level: DifficultyLevel;
  name: string;
  description: string;
}

export const DIFFICULTIES: DifficultyConfig[] = [
  { level: 1, name: "Principiante", description: "La máquina comete más errores y aprende poco de cada intento." },
  { level: 2, name: "Fácil", description: "Una máquina con pistas básicas y decisiones poco precisas." },
  { level: 3, name: "Normal", description: "La dificultad de referencia para una partida equilibrada." },
  { level: 4, name: "Difícil", description: "La máquina aprovecha mejor la información de tus intentos." },
  { level: 5, name: "Experto", description: "La máquina busca reducir al máximo las posibilidades restantes." },
];
