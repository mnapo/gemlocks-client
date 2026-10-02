import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const GAME_COOKIE = "gemlocks_game";
export const GAME_TIMEOUT_MS = 90_000;

export type GameState = {
  gameId: string;
  userId: string;
  humanSecret: string;
  machineSecret: string;
  difficulty: number;
  starter: "human" | "machine";
  currentPlayer: "human" | "machine";
  humanGuesses: { guess: string; perfect: number; regular: number }[];
  machineGuesses: { guess: string; perfect: number; regular: number }[];
  firstWinner: "human" | "machine" | null;
  finalTurnUsed: boolean;
};

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

export async function getSessionUser(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

export async function signGameId(gameId: string) {
  return new SignJWT({ gameId }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secret());
}

export async function getGameId(req: NextRequest) {
  const token = req.cookies.get(GAME_COOKIE)?.value;
  if (!token) return null;
  const { payload } = await jwtVerify(token, secret());
  return typeof payload.gameId === "string" ? payload.gameId : null;
}

export async function loadGame(req: NextRequest) {
  const gameId = await getGameId(req);
  if (!gameId) return null;
  const user = await getSessionUser(req);
  if (!user) return null;
  const { data, error } = await getAdminClient()
    .from("game_sessions")
    .select("game_id,user_id,human_secret,machine_secret,difficulty,starter,human_guesses,machine_guesses,first_winner,final_turn_used,current_player,status,last_seen_at")
    .eq("game_id", gameId)
    .eq("user_id", user.sub)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  if (data.status === "active" && Date.now() - new Date(data.last_seen_at).getTime() > GAME_TIMEOUT_MS) {
    await finishGame(gameId, user.sub, "defeat");
    return null;
  }
  return {
    ...data,
    state: {
      gameId: data.game_id,
      userId: data.user_id,
      humanSecret: data.human_secret,
      machineSecret: data.machine_secret,
      difficulty: data.difficulty,
      starter: data.starter as "human" | "machine",
      currentPlayer: data.current_player as "human" | "machine",
      humanGuesses: data.human_guesses as GameState["humanGuesses"],
      machineGuesses: data.machine_guesses as GameState["machineGuesses"],
      firstWinner: data.first_winner as "human" | "machine" | null,
      finalTurnUsed: data.final_turn_used,
    },
  };
}

export async function touchGame(gameId: string, userId: string, state?: GameState) {
  const update: Record<string, unknown> = { last_seen_at: new Date().toISOString() };
  if (state) {
    update.human_guesses = state.humanGuesses;
    update.machine_guesses = state.machineGuesses;
    update.first_winner = state.firstWinner;
    update.final_turn_used = state.finalTurnUsed;
    update.current_player = state.currentPlayer;
  }
  const { error } = await getAdminClient().from("game_sessions").update(update).eq("game_id", gameId).eq("user_id", userId).eq("status", "active");
  if (error) throw error;
}

export async function finishGame(gameId: string, userId: string, status: "victory" | "defeat" | "draw") {
  const client = getAdminClient();
  const { data, error } = await client.from("game_sessions").select("status").eq("game_id", gameId).eq("user_id", userId).maybeSingle();
  if (error) throw error;
  if (!data || data.status !== "active") return;
  const { error: updateError } = await client.from("game_sessions").update({ status, finished_at: new Date().toISOString(), last_seen_at: new Date().toISOString() }).eq("game_id", gameId).eq("user_id", userId).eq("status", "active");
  if (updateError) throw updateError;
  const { error: resultError } = await client.rpc("record_game_result", { p_user_id: userId, p_game_id: gameId, p_result: status });
  if (resultError) throw resultError;
}

export function setGameCookie(res: NextResponse, token: string) {
  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 2,
  });
}