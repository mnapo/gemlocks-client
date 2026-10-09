import { NextRequest, NextResponse } from "next/server";
import { chooseMachineGuess } from "@/lib/game/machine";
import { isValidCode, scoreGuess, type GuessResult } from "@/lib/game/engine";
import type { DifficultyLevel } from "@/lib/game/difficulty";
import { finishGame, loadGame, touchGame, clearGameCookie, setGameCookie, signGameId, type GameState } from "@/lib/game/session";
import { getGlyphSetForCode } from "@/lib/game/glyphs";
import { getAdminClient } from "@/lib/supabase/admin";

function result(score: GuessResult) { return { guess: score.guess, perfect: score.perfect, regular: score.regular }; }

export async function POST(req: NextRequest) {
  const game = await loadGame(req);
  if (!game) return NextResponse.json({ error: "No hay una partida activa" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const actor = body?.actor === "machine" ? "machine" : "human";
  const state = game.state;
  const glyphSet = getGlyphSetForCode(state.humanSecret);
  if (!glyphSet) return NextResponse.json({ error: "Set de glifos inválido" }, { status: 500 });
  const alphabet = glyphSet.glyphs.map((glyph) => glyph.value).filter((value): value is string => Boolean(value)).join("");

  if (actor !== state.currentPlayer) return NextResponse.json({ error: "No es el turno de ese jugador" }, { status: 409 });

  const difficulty = Number(state.difficulty) as DifficultyLevel;
  const guess = actor === "machine" ? chooseMachineGuess(state.machineGuesses, difficulty, Array.from(alphabet)) : String(body?.guess ?? "");
  if (!isValidCode(guess, alphabet)) return NextResponse.json({ error: "El código debe tener 4 glifos únicos" }, { status: 400 });

  const attack = scoreGuess(actor === "human" ? state.machineSecret : state.humanSecret, guess, alphabet);
  const nextHuman = actor === "human" ? [...state.humanGuesses, attack] : state.humanGuesses;
  const nextMachine = actor === "machine" ? [...state.machineGuesses, attack] : state.machineGuesses;
  const won = attack.perfect === 4;

  let status: "playing" | "final-turn" | "won" | "lost" | "draw" = "playing";
  let finalActor: "human" | "machine" | undefined;
  let firstWinner = state.firstWinner;
  let finalTurnUsed = state.finalTurnUsed;

  if (won && !firstWinner) {
    if (actor === state.starter) {
      status = "final-turn";
      firstWinner = actor;
      finalActor = actor === "human" ? "machine" : "human";
    } else {
      status = actor === "human" ? "won" : "lost";
      firstWinner = actor;
      finalTurnUsed = true;
    }
  } else if (firstWinner && actor !== firstWinner) {
    status = won ? "draw" : firstWinner === "human" ? "won" : "lost";
    finalTurnUsed = true;
  }

  let coinsReward = 0;
  let coinsBalance: number | undefined;
  const nextState: GameState = { ...state, currentPlayer: actor === "human" ? "machine" : "human", humanGuesses: nextHuman, machineGuesses: nextMachine, firstWinner, finalTurnUsed };
  if (status === "playing") {
    await touchGame(state.gameId, state.userId, nextState);
  } else if (status === "final-turn") {
    await touchGame(state.gameId, state.userId, nextState);
  } else {
    const finished = await finishGame(
      state.gameId,
      state.userId,
      status === "won" ? "victory" : status === "lost" ? "defeat" : "draw",
    );
    if (!finished) {
      return NextResponse.json({ error: "La partida no pudo finalizarse." }, { status: 500 });
    }
    if (status === "won") {
      const admin = getAdminClient();
      const { data: rewardRecord } = await admin.from("game_results").select("coins_reward").eq("game_id", state.gameId).eq("user_id", state.userId).maybeSingle();
      const { data: profile } = await admin.from("app_users").select("coins").eq("id", state.userId).maybeSingle();
      if (rewardRecord) coinsReward = Number(rewardRecord.coins_reward ?? 0);
      if (profile) coinsBalance = Number(profile.coins ?? 0);
    }
  }

  const res = NextResponse.json({ status, actor, result: result(attack), ...(status === "won" ? { coinsReward, ...(coinsBalance !== undefined ? { coinsBalance } : {}) } : {}), ...(actor === "machine" ? { machineGuess: guess } : {}), ...(finalActor ? { finalActor } : {}), ...(["won", "lost", "draw"].includes(status) ? { machineSecret: state.machineSecret } : {}) });
  if (status === "won" || status === "lost" || status === "draw") {
    clearGameCookie(res);
  } else {
    setGameCookie(res, await signGameId(state.gameId));
  }
  return res;
}