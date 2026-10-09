import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { GAME_BOTS } from "@/lib/game/bots";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });

  const client = getAdminClient();
  const [{ data: profile, error: profileError }, { data: rows, error: ownedError }] = await Promise.all([
    client.from("app_users").select("gems").eq("id", user.sub).single(),
    client.from("user_store_items").select("item_id").eq("user_id", user.sub),
  ]);
  if (profileError || ownedError) return NextResponse.json({ error: "No se pudieron cargar los bots." }, { status: 500 });

  const ownedIds = new Set((rows ?? []).map((row) => row.item_id));
  return NextResponse.json({
    gems: Number(profile.gems ?? 0),
    unlockedLevels: GAME_BOTS.filter((bot) => !bot.itemId || ownedIds.has(bot.itemId)).map((bot) => bot.level),
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const level = Number(body?.level);
  const bot = GAME_BOTS.find((entry) => entry.level === level);
  if (!bot || !bot.itemId || bot.price <= 0) {
    return NextResponse.json({ error: "Bot inválido." }, { status: 400 });
  }

  const client = getAdminClient();
  const { data, error } = await client.rpc("purchase_store_item", {
    p_user_id: user.sub,
    p_item_id: bot.itemId,
    p_price: bot.price,
  });

  if (error) {
    if (error.message.includes("insufficient_gems")) return NextResponse.json({ error: "No tenés suficientes gemas." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo desbloquear el bot." }, { status: 500 });
  }

  const { data: rows, error: ownedError } = await client.from("user_store_items").select("item_id").eq("user_id", user.sub);
  if (ownedError) return NextResponse.json({ error: "La compra se completó, pero no se pudo actualizar el inventario." }, { status: 500 });
  const ownedIds = new Set((rows ?? []).map((row) => row.item_id));
  return NextResponse.json({
    ok: true,
    gems: Number(data),
    unlockedLevels: GAME_BOTS.filter((entry) => !entry.itemId || ownedIds.has(entry.itemId)).map((entry) => entry.level),
  });
}
