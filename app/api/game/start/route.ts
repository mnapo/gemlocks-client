import { NextRequest, NextResponse } from "next/server";
import { generateCodes, isValidCode } from "@/lib/game/engine";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";
import { SignJWT } from "jose";

const GAME_COOKIE = "gemlocks_game";
const GAME_DURATION = "2h";

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const difficulty = Number(body?.difficulty) as DifficultyLevel;

  if (!DIFFICULTIES.some((item) => item.level === difficulty)) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 });
  }

  const codes = generateCodes();
  const secretCode = codes[Math.floor(Math.random() * codes.length)];
  if (!isValidCode(secretCode)) {
    return NextResponse.json({ error: "No se pudo iniciar la partida" }, { status: 500 });
  }

  const token = await new SignJWT({
    secret: secretCode,
    difficulty,
    starter: Math.random() < 0.5 ? "human" : "machine",
    humanGuesses: [],
    machineGuesses: [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(GAME_DURATION)
    .sign(secret());

  const res = NextResponse.json({ ok: true });
  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return res;
}
