import { NextRequest, NextResponse } from "next/server";
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
  const sharedSecret = String(payload.sharedSecret);

  const guess = actor === "machine"
    ? chooseMachineGuess(humanGuesses, difficulty)
    : String(body?.guess ?? "");

  if (!isValidCode(guess)) {
    return NextResponse.json({ error: "El código debe tener 4 dígitos únicos" }, { status: 400 });
  }

  const attack = scoreGuess(sharedSecret, guess);

  const nextHuman = actor === "human" ? [...humanGuesses, attack] : humanGuesses;
  const nextMachine = actor === "machine" ? [...machineGuesses, attack] : machineGuesses;
  const won = attack.perfect === 4;

  if (won) {
    return NextResponse.json({ status: actor === "human" ? "won" : "lost", actor, result: result(attack) });
  }

  const tokenPayload = {
    sharedSecret,
    difficulty,
    starter: payload.starter,
    humanGuesses: nextHuman,
    machineGuesses: nextMachine,
  };

  const nextToken = await new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());

  const res = NextResponse.json({ status: "playing", actor, result: result(attack) });
  res.cookies.set(GAME_COOKIE, nextToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return res;
}
