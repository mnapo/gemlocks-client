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
  const starter = payload.starter === "machine" ? "machine" : "human";
  const firstWinner = payload.firstWinner === "human" || payload.firstWinner === "machine" ? payload.firstWinner : null;
  const finalTurnUsed = payload.finalTurnUsed === true;

  if (firstWinner && finalTurnUsed) return NextResponse.json({ error: "La partida ya terminó" }, { status: 409 });

  const guess = actor === "machine"
    ? chooseMachineGuess(humanGuesses, difficulty)
    : String(body?.guess ?? "");

  if (!isValidCode(guess)) return NextResponse.json({ error: "El código debe tener 4 dígitos únicos" }, { status: 400 });

  const attack = scoreGuess(sharedSecret, guess);
  const nextHuman = actor === "human" ? [...humanGuesses, attack] : humanGuesses;
  const nextMachine = actor === "machine" ? [...machineGuesses, attack] : machineGuesses;
  const won = attack.perfect === 4;

  if (won && !firstWinner) {
    const isStarter = actor === starter;
    const opponent = actor === "human" ? "machine" : "human";

    if (isStarter) {
      const nextToken = await signGame({
        sharedSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine,
        firstWinner: actor, finalTurnUsed: false,
      });
      const res = NextResponse.json({
        status: "final-turn",
        actor,
        result: result(attack),
        finalActor: opponent,
      });
      setGameCookie(res, nextToken);
      return res;
    }

    // Status is always from the human player's perspective.
    const status = actor === "human" ? "won" : "lost";
    const nextToken = await signGame({
      sharedSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine,
      firstWinner: actor, finalTurnUsed: true,
    });
    const res = NextResponse.json({ status, actor, result: result(attack) });
    setGameCookie(res, nextToken);
    return res;
  }

  if (firstWinner && actor !== firstWinner) {
    const status = won ? "draw" : firstWinner === "human" ? "won" : "lost";
    const nextToken = await signGame({
      sharedSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine,
      firstWinner, finalTurnUsed: true,
    });
    const res = NextResponse.json({ status, actor, result: result(attack) });
    setGameCookie(res, nextToken);
    return res;
  }

  const nextToken = await signGame({
    sharedSecret, difficulty, starter, humanGuesses: nextHuman, machineGuesses: nextMachine,
    firstWinner: null, finalTurnUsed: false,
  });

  const res = NextResponse.json({
    status: "playing",
    actor,
    result: result(attack),
    ...(actor === "machine" ? { machineGuess: guess } : {}),
  });
  setGameCookie(res, nextToken);
  return res;
}

async function signGame(payload: Record<string, unknown>) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("2h").sign(secret());
}

function setGameCookie(res: NextResponse, token: string) {
  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
}
