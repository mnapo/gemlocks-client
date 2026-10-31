import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { jwtVerify, SignJWT } from "jose";
import type { NextRequest, NextResponse } from "next/server";
import { GLYPH_SETS, getGlyphSetForCode, type GlyphSetId } from "@/lib/game/glyphs";

export const GAME_COOKIE = "gemlocks_game";

export type GameState = {
  gameId: string;
  userId: string;
  humanSecret: string;
  machineSecret: string;
  difficulty: number;
  glyphValues: string[];
  humanGlyphSetId: GlyphSetId;
  opponentGlyphSetId: GlyphSetId;
  humanGlyphValues: string[];
  opponentGlyphValues: string[];
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

function asGlyphValues(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function resolveGlyphSet(id: unknown, code: string): GlyphSetId {
  if (typeof id === "string" && id in GLYPH_SETS) {
    const inferred = getGlyphSetForCode(code);
    // Older rows migrated with the default value may actually use another alphabet.
    if (id === "numeric" && inferred && inferred.id !== "numeric") return inferred.id;
    return id as GlyphSetId;
  }
  return getGlyphSetForCode(code)?.id ?? "numeric";
}

export async function loadGame(req: NextRequest) {
  const requestedGameId = await getGameId(req);
  const user = await getSessionUser(req);
  if (!user) return null;

  const client = getAdminClient();
  type SessionRow = {
    game_id: string; user_id: string; human_secret: string; machine_secret: string;
    difficulty: number; glyph_values: unknown; human_glyph_set_id?: unknown;
    opponent_glyph_set_id?: unknown; human_glyph_values?: unknown; opponent_glyph_values?: unknown;
    starter: string; human_guesses: unknown; machine_guesses: unknown; first_winner: string | null;
    final_turn_used: boolean; current_player: string; status: string; last_seen_at: string | null;
  };
  type QueryResult = { data: SessionRow | null; error: { code?: string; message: string } | null };
  const select = async (withParticipantGlyphs: boolean): Promise<QueryResult> => {
    let query = client.from("game_sessions")
      .select(withParticipantGlyphs
        ? "game_id,user_id,human_secret,machine_secret,difficulty,glyph_values,human_glyph_set_id,opponent_glyph_set_id,human_glyph_values,opponent_glyph_values,starter,human_guesses,machine_guesses,first_winner,final_turn_used,current_player,status,last_seen_at"
        : "game_id,user_id,human_secret,machine_secret,difficulty,glyph_values,starter,human_guesses,machine_guesses,first_winner,final_turn_used,current_player,status,last_seen_at")
      .eq("user_id", user.sub);

    if (requestedGameId) query = query.eq("game_id", requestedGameId);
    else query = query.eq("status", "active").order("created_at", { ascending: false }).limit(1);
    return await query.maybeSingle() as unknown as QueryResult;
  };

  let { data, error } = await select(true);
  if (error && (error.code === "42703" || /human_glyph_set_id|opponent_glyph_set_id|human_glyph_values|opponent_glyph_values/.test(error.message))) {
    ({ data, error } = await select(false));
  }
  if (error) throw error;
  if (!data) return null;

  const legacyValues = asGlyphValues(data.glyph_values);
  const humanGlyphSetId = resolveGlyphSet(data.human_glyph_set_id, data.human_secret);
  const opponentGlyphSetId = resolveGlyphSet(data.opponent_glyph_set_id, data.machine_secret);
  const humanGlyphValues = asGlyphValues(data.human_glyph_values);
  const opponentGlyphValues = asGlyphValues(data.opponent_glyph_values);

  return {
    ...data,
    state: {
      gameId: data.game_id,
      userId: data.user_id,
      humanSecret: data.human_secret,
      machineSecret: data.machine_secret,
      difficulty: data.difficulty,
      glyphValues: legacyValues,
      humanGlyphSetId,
      opponentGlyphSetId,
      humanGlyphValues: humanGlyphValues.length ? humanGlyphValues : legacyValues.length ? legacyValues : GLYPH_SETS[humanGlyphSetId].glyphs.map((glyph) => glyph.value).filter((value): value is string => Boolean(value)),
      opponentGlyphValues: opponentGlyphValues.length ? opponentGlyphValues : legacyValues.length ? legacyValues : GLYPH_SETS[opponentGlyphSetId].glyphs.map((glyph) => glyph.value).filter((value): value is string => Boolean(value)),
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
