import { NextRequest, NextResponse } from "next/server";
import { loadGame, touchGame } from "@/lib/game/session";

export async function GET(req: NextRequest) {
  const game = await loadGame(req);
  if (!game) return NextResponse.json({ active: false });
  await touchGame(game.state.gameId, game.state.userId);
  return NextResponse.json({ active: true, state: {
    gameId: game.state.gameId,
    difficulty: game.state.difficulty,
    glyphValues: game.state.glyphValues,
    humanGlyphSetId: game.state.humanGlyphSetId,
    opponentGlyphSetId: game.state.opponentGlyphSetId,
    humanGlyphValues: game.state.humanGlyphValues,
    opponentGlyphValues: game.state.opponentGlyphValues,
    starter: game.state.starter,
    currentPlayer: game.state.currentPlayer,
    humanSecret: game.state.humanSecret,
    humanGuesses: game.state.humanGuesses,
    machineGuesses: game.state.machineGuesses,
    firstWinner: game.state.firstWinner,
    finalTurnUsed: game.state.finalTurnUsed,
  }});
}