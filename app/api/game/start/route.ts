import { NextRequest, NextResponse } from "next/server";
import { generateCodes, isValidCode } from "@/lib/game/engine";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";
import { SignJWT } from "jose";

const GAME_COOKIE = "gemlocks_game";

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const difficulty = Number(body?.difficulty) as DifficultyLevel;
  const playerCode = String(body?.playerCode ?? "");

  if (!DIFFICULTIES.some((item) => item.level === difficulty)) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 });
  }

  if (!isValidCode(playerCode)) {
    return NextResponse.json({ error: "Tu código debe tener 4 glifos únicos" }, { status: 400 });
  }

  const codes = generateCodes();
  const sharedSecret = codes[Math.floor(Math.random() * codes.length)];
  const starter = Math.random() < 0.5 ? "human" : "machine";

  const token = await new SignJWT({
    sharedSecret,
    playerCode,
    difficulty,
    starter,
    humanGuesses: [],
    machineGuesses: [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());

  const res = NextResponse.json({ ok: true, starter });
  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });
  return res;
}
