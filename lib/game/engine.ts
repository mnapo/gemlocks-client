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

export function isValidCode(code: string): boolean {
  return code.length === CODE_LENGTH && /^\d{4}$/.test(code) && new Set(code).size === CODE_LENGTH;
}

export function generateCodes(): string[] {
  const codes: string[] = [];

  for (let a = 0; a <= 9; a++) {
    for (let b = 0; b <= 9; b++) {
      for (let c = 0; c <= 9; c++) {
        for (let d = 0; d <= 9; d++) {
          const code = `${a}${b}${c}${d}`;
          if (isValidCode(code)) codes.push(code);
        }
      }
    }
  }

  return codes;
}

export function scoreGuess(secret: string, guess: string): GuessResult {
  if (!isValidCode(secret) || !isValidCode(guess)) {
    throw new Error("El código debe tener 4 dígitos únicos.");
  }

  let perfect = 0;
  const secretRest: string[] = [];
  const guessRest: string[] = [];

  for (let i = 0; i < CODE_LENGTH; i++) {
    if (secret[i] === guess[i]) {
      perfect++;
    } else {
      secretRest.push(secret[i]);
      guessRest.push(guess[i]);
    }
  }

  const regular = guessRest.filter((digit) => secretRest.includes(digit)).length;

  return { guess, perfect, regular };
}

export function filterCandidates(candidates: string[], result: GuessResult): string[] {
  return candidates.filter((candidate) => {
    const score = scoreGuess(candidate, result.guess);
    return score.perfect === result.perfect && score.regular === result.regular;
  });
}

export function hasWon(result: GuessResult): boolean {
  return result.perfect === CODE_LENGTH;
}

export function createGame(secret: string, starter: Player): GameState {
  if (!isValidCode(secret)) throw new Error("Código secreto inválido.");

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

export function playTurn(state: GameState, guess: string): GameState {
  const result = scoreGuess(state.secret, guess);

  return {
    ...state,
    currentPlayer: state.currentPlayer === "human" ? "machine" : "human",
    humanGuesses: state.currentPlayer === "human" ? [...state.humanGuesses, result] : state.humanGuesses,
    machineGuesses: state.currentPlayer === "machine" ? [...state.machineGuesses, result] : state.machineGuesses,
  };
}
