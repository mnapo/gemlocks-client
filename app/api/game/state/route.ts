import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const GAME_COOKIE = "gemlocks_game";

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(GAME_COOKIE)?.value;
  if (!token) return NextResponse.json({ active: false });

  try {
    const { payload } = await jwtVerify(token, secret());
    const humanGuesses = Array.isArray(payload.humanGuesses) ? payload.humanGuesses : [];
    const machineGuesses = Array.isArray(payload.machineGuesses) ? payload.machineGuesses : [];
    const starter = payload.starter === "machine" ? "machine" : "human";
    const firstWinner = payload.firstWinner === "human" || payload.firstWinner === "machine" ? payload.firstWinner : null;
    const finalTurnUsed = payload.finalTurnUsed === true;
    const finalActor = firstWinner ? (firstWinner === "human" ? "machine" : "human") : null;

    let phase: "player-turn" | "thinking" | "final-turn" | "won" | "lost" | "draw" = "player-turn";
    let status: "active" | "won" | "lost" | "draw" = "active";

    if (firstWinner && finalTurnUsed) {
      const firstWon = firstWinner === "human";
      const secondGuesses = firstWinner === "human" ? machineGuesses : humanGuesses;
      const secondWon = secondGuesses.some((item) => item.perfect === 4);
      status = secondWon ? "draw" : firstWon ? "won" : "lost";
      phase = status;
    } else if (firstWinner) {
      phase = finalActor === "human" ? "player-turn" : "thinking";
    } else {
      const humanTurn = starter === "human"
        ? humanGuesses.length === machineGuesses.length
        : humanGuesses.length < machineGuesses.length;
      phase = humanTurn ? "player-turn" : "thinking";
    }

    return NextResponse.json({
      active: true,
      phase,
      status,
      difficulty: Number(payload.difficulty),
      starter,
      finalActor,
      mySecret: String(payload.humanSecret ?? ""),
      humanResults: humanGuesses,
      machineResults: machineGuesses,
    });
  } catch {
    return NextResponse.json({ active: false });
  }
}
