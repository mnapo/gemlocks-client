export const CODE_LENGTH = 4;
export const DIGITS = "0123456789";

export type Player = "human" | "machine";

export interface GuessResult {
  guess: string;
  perfect: number;
  regular: number;
}

export interface GameState {
  secret: string;
  starter: Player;
  currentPlayer: Player;
  humanGuesses: GuessResult[];
  machineGuesses: GuessResult[];
  humanFinalTurn: boolean;
  machineFinalTurn: boolean;
}

function codeGlyphs(code: string): string[] {
  return Array.from(code);
}

export function isValidCode(code: string, alphabet = DIGITS): boolean {
  const glyphs = codeGlyphs(code);
  const available = new Set(Array.from(alphabet));
  return glyphs.length === CODE_LENGTH && glyphs.every((glyph) => available.has(glyph)) && new Set(glyphs).size === CODE_LENGTH;
}

export function generateCodes(alphabet = DIGITS): string[] {
  const glyphs = Array.from(alphabet);
  const codes: string[] = [];

  for (const a of glyphs) {
    for (const b of glyphs) {
      for (const c of glyphs) {
        for (const d of glyphs) {
          const code = a + b + c + d;
          if (isValidCode(code, alphabet)) codes.push(code);
        }
      }
    }
  }

  return codes;
}

export function scoreGuess(secret: string, guess: string, alphabet = DIGITS): GuessResult {
  if (!isValidCode(secret, alphabet) || !isValidCode(guess, alphabet)) {
    throw new Error("El código debe tener 4 glifos únicos.");
  }

  const secretGlyphs = codeGlyphs(secret);
  const guessGlyphs = codeGlyphs(guess);
  let perfect = 0;
  const secretRest: string[] = [];
  const guessRest: string[] = [];

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secretGlyphs[i] === guessGlyphs[i]) {
      perfect++;
    } else {
      secretRest.push(secretGlyphs[i]);
      guessRest.push(guessGlyphs[i]);
    }
  }

  const regular = guessRest.filter((glyph) => secretRest.includes(glyph)).length;

  return { guess, perfect, regular };
}

export function filterCandidates(candidates: string[], result: GuessResult, alphabet = DIGITS): string[] {
  return candidates.filter((candidate) => {
    const score = scoreGuess(candidate, result.guess, alphabet);
    return score.perfect === result.perfect && score.regular === result.regular;
  });
}

export function hasWon(result: GuessResult): boolean {
  return result.perfect === CODE_LENGTH;
}

export function createGame(secret: string, starter: Player, alphabet = DIGITS): GameState {
  if (!isValidCode(secret, alphabet)) throw new Error("Código secreto inválido.");

  return {
    secret,
    starter,
    currentPlayer: starter,
    humanGuesses: [],
    machineGuesses: [],
    humanFinalTurn: starter === "machine",
    machineFinalTurn: starter === "human",
  };
}

export function playTurn(state: GameState, guess: string, alphabet = DIGITS): GameState {
  const result = scoreGuess(state.secret, guess, alphabet);

  return {
    ...state,
    currentPlayer: state.currentPlayer === "human" ? "machine" : "human",
    humanGuesses: state.currentPlayer === "human" ? [...state.humanGuesses, result] : state.humanGuesses,
    machineGuesses: state.currentPlayer === "machine" ? [...state.machineGuesses, result] : state.machineGuesses,
  };
}
