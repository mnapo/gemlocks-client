import {
  filterCandidates,
  generateCodes,
  scoreGuess,
  type GuessResult,
} from "@/lib/game/engine";
import type { DifficultyLevel } from "@/lib/game/difficulty";

const ALL_CODES = generateCodes();

function randomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function scoreCandidate(candidate: string, possibleSecrets: string[]): number {
  const buckets = new Map<string, number>();

  for (const secret of possibleSecrets) {
    const result = scoreGuess(secret, candidate);
    const key = `${result.perfect}:${result.regular}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  return Math.max(...buckets.values());
}

export function chooseMachineGuess(
  history: GuessResult[],
  difficulty: DifficultyLevel,
): string {
  let candidates = ALL_CODES;

  for (const result of history) {
    candidates = filterCandidates(candidates, result);
  }

  if (candidates.length === 0) return randomItem(ALL_CODES);
  if (candidates.length === 1) return candidates[0];

  if (difficulty === 1) return randomItem(ALL_CODES);

  if (difficulty === 2) return randomItem(candidates);

  if (difficulty === 3) {
    const pool = candidates.slice(0, Math.min(candidates.length, 100));
    return randomItem(pool);
  }

  const sampleSize = difficulty === 4 ? 120 : 300;
  const pool = candidates.slice(0, Math.min(candidates.length, sampleSize));

  let bestGuess = pool[0];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const guess of pool) {
    const score = scoreCandidate(guess, candidates);
    if (score < bestScore) {
      bestScore = score;
      bestGuess = guess;
    }
  }

  return bestGuess;
}
