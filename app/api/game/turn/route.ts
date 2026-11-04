import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { chooseMachineGuess } from "@/lib/game/machine";
import { isValidCode, scoreGuess, type GuessResult } from "@/lib/game/engine";
import type { DifficultyLevel } from "@/lib/game/difficulty";
import { loadGame, clearGameCookie, setGameCookie, signGameId, type GameState } from "@/lib/game/session";
import { GLYPH_SETS, type GlyphSetId } from "@/lib/game/glyphs";
import { getAdminClient } from "@/lib/supabase/admin";

function result(score: GuessResult) { return { guess: score.guess, perfect: score.perfect, regular: score.regular }; }

export async function POST(req: NextRequest) {
  const game = await loadGame(req);
  if (!game) return NextResponse.json({ error: "No hay una partida activa" }, { status: 400 });
  const body = await req.json().catch(() => null);
  const actor = body?.actor === "machine" ? "machine" : "human";
  const requestId = typeof body?.requestId === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.requestId) ? body.requestId : null;
  if (!requestId) return NextResponse.json({ error: "Identificador de turno inválido." }, { status: 400 });

  const state = game.state;
  const previous = await getAdminClient().rpc("get_game_turn_response", {
    p_game_id: state.gameId, p_user_id: state.userId, p_request_id: requestId,
  });
  if (previous.error) {
    console.error("get_game_turn_response failed", previous.error);
    return NextResponse.json({ error: "No se pudo verificar el estado del ataque." }, { status: 503 });
  }
  if (previous.data) {
    const saved = previous.data as Record<string, unknown>;
    const terminal = ["won", "lost", "draw"].includes(String(saved.status));
    let extra: Record<string, unknown> = {};
    if (terminal) {
      const admin = getAdminClient();
      const { data: reward } = await admin.from("game_results").select("coins_reward, experience_reward, level_up, level_reward_coins, level_reward_gems, resulting_level, resulting_experience").eq("game_id", state.gameId).eq("user_id", state.userId).maybeSingle();
      const { data: profile } = await admin.from("app_users").select("coins, level, experience").eq("id", state.userId).maybeSingle();
      if (reward) extra = {
        coinsReward: Number(reward.coins_reward ?? 0),
        progression: {
          experienceReward: Number(reward.experience_reward ?? 0), levelUp: Boolean(reward.level_up),
          levelRewardCoins: Number(reward.level_reward_coins ?? 0), levelRewardGems: Number(reward.level_reward_gems ?? 0),
          level: Number(reward.resulting_level ?? profile?.level ?? 1), experience: Number(reward.resulting_experience ?? profile?.experience ?? 0),
        },
      };
      if (profile) extra.coinsBalance = Number(profile.coins ?? 0);
    }
    const replay = NextResponse.json({ ...saved, ...extra, duplicate: true });
    if (terminal) clearGameCookie(replay);
    else setGameCookie(replay, await signGameId(state.gameId));
    return replay;
  }

  const humanSetId = state.humanGlyphSetId as GlyphSetId;
  const opponentSetId = state.opponentGlyphSetId as GlyphSetId;
  const humanAlphabet = (state.humanGlyphValues.length ? state.humanGlyphValues : GLYPH_SETS[humanSetId].glyphs.map((glyph) => glyph.value).filter((value): value is string => Boolean(value))).join("");
  const opponentAlphabet = (state.opponentGlyphValues.length ? state.opponentGlyphValues : GLYPH_SETS[opponentSetId].glyphs.map((glyph) => glyph.value).filter((value): value is string => Boolean(value))).join("");
  const alphabet = actor === "human" ? opponentAlphabet : humanAlphabet;

  if (actor !== state.currentPlayer) return NextResponse.json({ error: "No es el turno de ese jugador" }, { status: 409 });

  const difficulty = Number(state.difficulty) as DifficultyLevel;
  const guess = actor === "machine" ? chooseMachineGuess(state.machineGuesses, difficulty, Array.from(alphabet), state.humanSecret) : String(body?.guess ?? "");
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

  const terminalResult = status === "won" ? "victory" : status === "lost" ? "defeat" : status === "draw" ? "draw" : null;
  const response = {
    status, actor, result: result(attack),
    ...(actor === "machine" ? { machineGuess: guess } : {}),
    ...(finalActor ? { finalActor } : {}),
    ...(["won", "lost", "draw"].includes(status) ? { machineSecret: state.machineSecret } : {}),
  };
  const committed = await getAdminClient().rpc("commit_game_turn", {
    p_game_id: state.gameId,
    p_user_id: state.userId,
    p_actor: actor,
    p_request_id: requestId,
    p_expected_version: state.turnVersion,
    p_human_guesses: nextHuman,
    p_machine_guesses: nextMachine,
    p_first_winner: firstWinner,
    p_final_turn_used: finalTurnUsed,
    p_current_player: actor === "human" ? "machine" : "human",
    p_response: response,
    p_terminal_result: terminalResult,
  });

  if (committed.error) {
    console.error("commit_game_turn failed", committed.error);
    return NextResponse.json({ error: "No se pudo guardar el ataque. El turno sigue pendiente." }, { status: 503 });
  }
  const commitData = committed.data as { accepted?: boolean; duplicate?: boolean; reason?: string; [key: string]: unknown } | null;
  if (!commitData?.accepted) {
    return NextResponse.json({ error: "El estado de la partida cambió. Actualizá la partida para continuar.", reason: commitData?.reason }, { status: 409 });
  }

  let coinsReward = 0;
  let coinsBalance: number | undefined;
  let progression: { experienceReward: number; levelUp: boolean; levelRewardCoins: number; levelRewardGems: number; level: number; experience: number } | undefined;
  if (terminalResult) {
    const admin = getAdminClient();
    const { data: rewardRecord } = await admin.from("game_results")
      .select("coins_reward, experience_reward, level_up, level_reward_coins, level_reward_gems, resulting_level, resulting_experience")
      .eq("game_id", state.gameId).eq("user_id", state.userId).maybeSingle();
    const { data: profile } = await admin.from("app_users").select("coins, level, experience").eq("id", state.userId).maybeSingle();
    if (rewardRecord) {
      coinsReward = Number(rewardRecord.coins_reward ?? 0);
      progression = {
        experienceReward: Number(rewardRecord.experience_reward ?? 0),
        levelUp: Boolean(rewardRecord.level_up),
        levelRewardCoins: Number(rewardRecord.level_reward_coins ?? 0),
        levelRewardGems: Number(rewardRecord.level_reward_gems ?? 0),
        level: Number(rewardRecord.resulting_level ?? profile?.level ?? 1),
        experience: Number(rewardRecord.resulting_experience ?? profile?.experience ?? 0),
      };
    }
    if (profile) coinsBalance = Number(profile.coins ?? 0);
  }

  const res = NextResponse.json({
    ...response,
    ...(status === "won" ? { coinsReward } : {}),
    ...(coinsBalance !== undefined ? { coinsBalance } : {}),
    ...(progression ? { progression } : {}),
  });
  if (terminalResult) clearGameCookie(res);
  else setGameCookie(res, await signGameId(state.gameId));
  return res;
}
