import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { jwtVerify } from "jose";

const GAME_COOKIE = "gemlocks_game";

function secret() {
  const value = process.env.AUTH_JWT_SECRET;
  if (!value) throw new Error("Falta AUTH_JWT_SECRET.");
  return new TextEncoder().encode(value);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(GAME_COOKIE)?.value;
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(GAME_COOKIE);
  if (!token) return res;

  try {
    const { payload } = await jwtVerify(token, secret());
    const firstWinner = payload.firstWinner === "human" || payload.firstWinner === "machine" ? payload.firstWinner : null;
    const finalTurnUsed = payload.finalTurnUsed === true;

    if (firstWinner && finalTurnUsed) return res;

    const gameId = String(payload.gameId ?? "");
    const sessionToken = req.cookies.get(SESSION_COOKIE)?.value;
    const user = sessionToken ? await verifySessionToken(sessionToken) : null;
    if (!user || !gameId) return res;

    const { error } = await getAdminClient().rpc("record_game_result", {
      p_user_id: user.sub,
      p_game_id: gameId,
      p_result: "defeat",
    });
    if (error) return NextResponse.json({ error: "No se pudo registrar la derrota." }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "No se pudo cerrar la partida." }, { status: 500 });
  }

  return res;
}
