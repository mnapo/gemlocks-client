export type Player = "human" | "machine";

export type GuessResult = {
  perfect: number;
  regular: number;
};

export type GameDifficulty = "easy" | "normal" | "hard";

export type GameConfig = {
  codeLength: number;
  codeAlphabet: string[];
  codeSelectionSeconds: number;
};
