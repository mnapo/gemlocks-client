import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";

export const GAME_COOKIE = "gemlocks_game";

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
  const requestedGameId = await getGameId(req);
  const user = await getSessionUser(req);
  if (!user) return null;

  let query = getAdminClient()
    .from("game_sessions")
    .select("game_id,user_id,human_secret,machine_secret,difficulty,starter,human_guesses,machine_guesses,first_winner,final_turn_used,current_player,status,last_seen_at")
    .eq("user_id", user.sub);

  if (requestedGameId) {
    query = query.eq("game_id", requestedGameId);
  } else {
    query = query.eq("status", "active").order("created_at", { ascending: false }).limit(1);
  }

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  if (!data) return null;
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
  const { data, error } = await getAdminClient().rpc("finish_game", {
    p_user_id: userId,
    p_game_id: gameId,
    p_result: status,
  });
  if (error) throw error;
  return data === true;
}

export function clearGameCookie(res: NextResponse) {
  res.cookies.set(GAME_COOKIE, "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0,
  });
}

export function setGameCookie(res: NextResponse, token: string) {
  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 2,
  });
}