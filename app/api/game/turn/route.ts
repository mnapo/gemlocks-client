import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { jwtVerify, SignJWT } from "jose";
import { chooseMachineGuess } from "@/lib/game/machine";
import { isValidCode, scoreGuess, type GuessResult } from "@/lib/game/engine";
import type { DifficultyLevel } from "@/lib/game/difficulty";

const GAME_COOKIE = "gemlocks_game";

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

function result(score: GuessResult) {
  return { guess: score.guess, perfect: score.perfect, regular: score.regular };
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(GAME_COOKIE)?.value;
  if (!token) return NextResponse.json({ error: "No hay una partida activa" }, { status: 400 });
  const { payload } = await jwtVerify(token, secret());
  const body = await req.json().catch(() => null);
  const actor = body?.actor === "machine" ? "machine" : "human";
  const difficulty = Number(payload.difficulty) as DifficultyLevel;
  const humanGuesses = Array.isArray(payload.humanGuesses) ? payload.humanGuesses as GuessResult[] : [];
  const machineGuesses = Array.isArray(payload.machineGuesses) ? payload.machineGuesses as GuessResult[] : [];
  const humanSecret = String(payload.humanSecret);
  const machineSecret = String(payload.machineSecret);
  const starter = payload.starter === "machine" ? "machine" : "human";
  const firstWinner = payload.firstWinner === "human" || payload.firstWinner === "machine" ? payload.firstWinner : null;
  const gameId = String(payload.gameId ?? "");
  const finalTurnUsed = payload.finalTurnUsed === true;

  if (firstWinner && finalTurnUsed) return NextResponse.json({ error: "La partida ya terminó" }, { status: 409 });

  const guess = actor === "machine" ? chooseMachineGuess(machineGuesses, difficulty) : String(body?.guess ?? "");
  if (!isValidCode(guess)) return NextResponse.json({ error: "El código debe tener 4 glifos únicos" }, { status: 400 });

  const attack = scoreGuess(actor === "human" ? machineSecret : humanSecret, guess);
  const nextHuman = actor === "human" ? [...humanGuesses, attack] : humanGuesses;
  const nextMachine = actor === "machine" ? [...machineGuesses, attack] : machineGuesses;
  const won = attack.perfect === 4;

  if (won && !firstWinner) {
    if (actor === starter) {
      const nextToken = await signGame({ humanSecret, machineSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine, firstWinner: actor, finalTurnUsed: false });
      const res = NextResponse.json({ status: "final-turn", actor, result: result(attack), finalActor: actor === "human" ? "machine" : "human" });
      setGameCookie(res, nextToken);
      return res;
    }
    const status = actor === "human" ? "won" : "lost";
    await recordResult(req, gameId, status);
    const nextToken = await signGame({ humanSecret, machineSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine, firstWinner: actor, finalTurnUsed: true });
    const res = NextResponse.json({ status, actor, result: result(attack) });
    setGameCookie(res, nextToken);
    return res;
  }

  if (firstWinner && actor !== firstWinner) {
    const status = won ? "draw" : firstWinner === "human" ? "won" : "lost";
    await recordResult(req, gameId, status);
    const nextToken = await signGame({ humanSecret, machineSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine, firstWinner, finalTurnUsed: true });
    const res = NextResponse.json({ status, actor, result: result(attack) });
    setGameCookie(res, nextToken);
    return res;
  }

  const nextToken = await signGame({ humanSecret, machineSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine, firstWinner: null, finalTurnUsed: false });
  const res = NextResponse.json({ status: "playing", actor, result: result(attack), ...(actor === "machine" ? { machineGuess: guess } : {}) });
  setGameCookie(res, nextToken);
  return res;
}

async function signGame(payload: Record<string, unknown>) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secret());
}

function setGameCookie(res: NextResponse, token: string) {
  res.cookies.set(GAME_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 2 });
}

async function recordResult(req: NextRequest, gameId: string, status: "won" | "lost" | "draw") {
  if (!gameId) throw new Error("Falta el identificador de la partida.");

  const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
  const user = sessionToken ? await verifySessionToken(sessionToken) : null;
  if (!user) throw new Error("Sesión inválida.");

  const result = status === "won" ? "victory" : status === "lost" ? "defeat" : "draw";
  const { error } = await getAdminClient().rpc("record_game_result", {
    p_user_id: user.sub,
    p_game_id: gameId,
    p_result: result,
  });

  if (error) throw error;
}
