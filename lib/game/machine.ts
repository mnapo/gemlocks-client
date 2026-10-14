import {
  filterCandidates,
  generateCodes,
  scoreGuess,
  type GuessResult,
} from "@/lib/game/engine";
import type { DifficultyLevel } from "@/lib/game/difficulty";

const codeCache = new Map<string, string[]>();
const MIN_GUESSES_BEFORE_LOW_LEVEL_WIN = 4;

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function sample<T>(items: T[], size: number): T[] {
  if (items.length <= size) return items;
  const pool = [...items];
  for (let i = 0; i < size; i++) {
    const j = i + Math.floor(Math.random() * (pool.length - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, size);
}

function getAllCodes(glyphs: string[]): string[] {
  const key = glyphs.join("");
  const cached = codeCache.get(key);
  if (cached) return cached;
  const codes = generateCodes(key);
  codeCache.set(key, codes);
  return codes;
}

function scoreCandidate(candidate: string, possibleSecrets: string[], alphabet: string): number {
  const buckets = new Map<string, number>();

  for (const secret of possibleSecrets) {
    const result = scoreGuess(secret, candidate, alphabet);
    const key = `${result.perfect}:${result.regular}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Math.max(...buckets.values());
}

function getPossibleSecrets(allCodes: string[], history: GuessResult[], alphabet: string): string[] {
  let candidates = allCodes;

  // A 0:0 result naturally removes every code containing any glyph from that guess.
  // Apply every result cumulatively so levels 3–5 never reuse eliminated glyphs.
  for (const result of history) {
    if (result.perfect === 0 && result.regular === 0) {
      const excludedGlyphs = new Set(Array.from(result.guess));
      candidates = candidates.filter((candidate) =>
        Array.from(candidate).every((glyph) => !excludedGlyphs.has(glyph)),
      );
      continue;
    }

    candidates = filterCandidates(candidates, result, alphabet);
  }

  return candidates;
}

export function chooseMachineGuess(
  history: GuessResult[],
  difficulty: DifficultyLevel,
  glyphs: string[],
  targetSecret?: string,
): string {
  const alphabet = glyphs.join("");
  const allCodes = getAllCodes(glyphs);
  const usedGuesses = new Set(history.map((result) => result.guess));
  const candidates = getPossibleSecrets(allCodes, history, alphabet);

  // Levels 1–3 are deliberately prevented from solving the code before their fifth guess.
  const delayEarlyWin = difficulty <= 3 && history.length < MIN_GUESSES_BEFORE_LOW_LEVEL_WIN;
  const canGuess = (code: string) =>
    !usedGuesses.has(code) && !(delayEarlyWin && targetSecret !== undefined && code === targetSecret);

  const remainingCandidates = candidates.filter(canGuess);
  const fallback = allCodes.filter(canGuess);
  const pool = remainingCandidates.length > 0 ? remainingCandidates : fallback;

  if (pool.length === 0) {
    // Defensive fallback for malformed or exhausted histories.
    return randomItem(allCodes);
  }

  // Spark makes occasional unhelpful guesses, while still learning enough to finish a match.
  if (difficulty === 1 && Math.random() < 0.25) {
    return randomItem(fallback.length > 0 ? fallback : pool);
  }

  // Byte uses all feedback but chooses without a deduction strategy.
  if (difficulty === 1 || difficulty === 2) {
    return randomItem(pool);
  }

  // Nexus mostly guesses randomly, but occasionally compares a small sample.
  // This gives it a modest edge over levels 1–2 without approaching minimax play.
  if (difficulty === 3) {
    if (Math.random() < 0.8) return randomItem(pool);

    const sampled = sample(pool, 12);
    let bestGuess = sampled[0];
    let bestScore = Number.POSITIVE_INFINITY;

    for (const guess of sampled) {
      const score = scoreCandidate(guess, candidates, alphabet);
      if (score < bestScore) {
        bestScore = score;
        bestGuess = guess;
      }
    }

    return bestGuess;
  }

  // Oracle and Singularity use increasingly broad minimax searches.
  const searchSize = difficulty === 4 ? 120 : 300;
  const searchPool = sample(pool, searchSize);
  let bestGuess = searchPool[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const guess of searchPool) {
    const score = scoreCandidate(guess, candidates, alphabet);
    if (score < bestScore) {
      bestScore = score;
      bestGuess = guess;
    }
  }

  return bestGuess;
}
