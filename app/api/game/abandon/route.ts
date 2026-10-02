import { NextRequest, NextResponse } from "next/server";
import { finishGame, loadGame } from "@/lib/game/session";

export async function POST(req: NextRequest) {
  const game = await loadGame(req);
  if (!game) return NextResponse.json({ active: false });

  try {
    await finishGame(game.state.gameId, game.state.userId, "defeat");
  } catch (error) {
    console.error("game/abandon failed:", error);
    return NextResponse.json({ error: "No se pudo registrar el abandono de la partida." }, { status: 500 });
  }
  const res = NextResponse.json({ active: false, status: "lost" });
  res.cookies.set("gemlocks_game", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}