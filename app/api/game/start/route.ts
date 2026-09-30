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
  const humanSecret = String(body?.humanSecret ?? "");

  if (!DIFFICULTIES.some((item) => item.level === difficulty)) {
    return NextResponse.json({ error: "Dificultad inválida" }, { status: 400 });
  }
  if (!isValidCode(humanSecret)) {
    return NextResponse.json({ error: "El código debe tener 4 glifos distintos" }, { status: 400 });
  }

  const codes = generateCodes();
  let machineSecret = codes[Math.floor(Math.random() * codes.length)];
  while (machineSecret === humanSecret) machineSecret = codes[Math.floor(Math.random() * codes.length)];

  const starter = Math.random() < 0.5 ? "human" : "machine";

  const token = await new SignJWT({
    humanSecret,
    machineSecret,
    difficulty,
    starter,
    humanGuesses: [],
    machineGuesses: [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret());

  const res = NextResponse.json({ ok: true, starter, humanSecret, machineSecret });

  res.cookies.set(GAME_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2,
  });

  return res;
}
