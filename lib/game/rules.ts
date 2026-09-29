import type { GameConfig } from "./types";

export const DEFAULT_GAME_CONFIG: GameConfig = {
  codeLength: 4,
  codeAlphabet: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  codeSelectionSeconds: 60,
};

export function isValidCode(code: string[], config = DEFAULT_GAME_CONFIG): boolean {
  return (
    code.length === config.codeLength &&
    code.every((glyph) => config.codeAlphabet.includes(glyph)) &&
    new Set(code).size === code.length
  );
}

export function scoreGuess(guess: string[], secret: string[]): { perfect: number; regular: number } {
  if (guess.length !== secret.length) return { perfect: 0, regular: 0 };

  let perfect = 0;
  let regular = 0;

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === secret[i]) {
      perfect++;
    } else if (secret.includes(guess[i])) {
      regular++;
    }
  }

  return { perfect, regular };
}
