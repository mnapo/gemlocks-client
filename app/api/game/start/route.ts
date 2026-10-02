import { NextRequest, NextResponse } from "next/server";
import { generateCodes, isValidCode } from "@/lib/game/engine";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";
import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { randomUUID } from "crypto";
import { signGameId, setGameCookie } from "@/lib/game/session";

export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const user = sessionToken ? await verifySessionToken(sessionToken) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const difficulty = Number(body?.difficulty) as DifficultyLevel;
  const humanSecret = String(body?.humanSecret ?? "");
  if (!DIFFICULTIES.some((item) => item.level === difficulty)) return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 });
  if (!isValidCode(humanSecret)) return NextResponse.json({ error: "El código debe tener 4 glifos distintos" }, { status: 400 });

  const client = getAdminClient();
  const { data: existing } = await client.from("game_sessions").select("game_id").eq("user_id", user.sub).eq("status","active").limit(1).maybeSingle();
  if (existing) return NextResponse.json({ error: "Ya tenés una partida activa" }, { status: 409 });

  const codes = generateCodes();
  let machineSecret = codes[Math.floor(Math.random() * codes.length)];
  while (machineSecret === humanSecret) machineSecret = codes[Math.floor(Math.random() * codes.length)];
  const starter = Math.random() < 0.5 ? "human" : "machine";
  const gameId = randomUUID();
  const state = { gameId, userId: user.sub, humanSecret, machineSecret, difficulty, starter, currentPlayer: starter, humanGuesses: [], machineGuesses: [], firstWinner: null, finalTurnUsed: false };

  const { error } = await client.from("game_sessions").insert({
    game_id: gameId,
    user_id: user.sub,
    human_secret: humanSecret,
    machine_secret: machineSecret,
    difficulty,
    starter,
    human_guesses: [],
    machine_guesses: [],
    first_winner: null,
    final_turn_used: false,
    status: "active",
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const res = NextResponse.json({ ok: true, gameId, starter, humanSecret });
  setGameCookie(res, await signGameId(gameId));
  return res;
}