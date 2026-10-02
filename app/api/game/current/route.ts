import { NextRequest, NextResponse } from "next/server";
import { loadGame } from "@/lib/game/session";

export async function GET(req: NextRequest) {
  const game = await loadGame(req);
  if (!game) return NextResponse.json({ active: false });
  return NextResponse.json({ active: true, state: {
    gameId: game.state.gameId,
    difficulty: game.state.difficulty,
    starter: game.state.starter,
    currentPlayer: game.state.currentPlayer,
    humanSecret: game.state.humanSecret,
    humanGuesses: game.state.humanGuesses,
    machineGuesses: game.state.machineGuesses,
    firstWinner: game.state.firstWinner,
    finalTurnUsed: game.state.finalTurnUsed,
  }});
}