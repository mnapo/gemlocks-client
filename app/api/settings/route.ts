import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { GLYPH_SETS, type GlyphSetId } from "@/lib/game/glyphs";

const glyphItemIds: Record<string, GlyphSetId> = {
  "glyphs-emoji": "emoji",
  "glyphs-runes": "runes",
  "glyphs-zodiac": "zodiac",
};
const avatarIds = ["avatar-pelota", "avatar-flores", "avatar-guitarra", "avatar-paisaje", "avatar-robot", "avatar-elfo", "avatar-elfa", "avatar-doctor", "avatar-doctora", "avatar-mago", "avatar-maga"];
const themeIds = ["theme-light", "theme-pink", "theme-ocean"];
const chestIds = ["chest-stone", "chest-pirate", "chest-futuristic"];

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  const body = await req.json().catch(() => null);
  const client = getAdminClient();
  const { data: ownedRows, error: ownedError } = await client.from("user_store_items").select("item_id").eq("user_id", user.sub);
  if (ownedError) return NextResponse.json({ error: "No se pudo consultar el inventario." }, { status: 500 });
  const owned = new Set((ownedRows ?? []).map((row) => row.item_id));
  const updates: Record<string, string> = {};

  if (typeof body?.glyphSetId === "string") {
    if (body.glyphSetId !== "numeric" && !GLYPH_SETS[body.glyphSetId as GlyphSetId]) return NextResponse.json({ error: "Set de glifos inválido." }, { status: 400 });
    const itemId = Object.keys(glyphItemIds).find((id) => glyphItemIds[id] === body.glyphSetId);
    if (itemId && !owned.has(itemId)) return NextResponse.json({ error: "No tenés ese set de glifos." }, { status: 403 });
    updates.active_glyph_set = body.glyphSetId;
  }
  if (typeof body?.avatarId === "string") {
    if (body.avatarId && (!avatarIds.includes(body.avatarId) || !owned.has(body.avatarId))) return NextResponse.json({ error: "No tenés ese avatar." }, { status: 403 });
    updates.active_avatar = body.avatarId;
  }
  if (typeof body?.chestId === "string") {
    if (body.chestId && (!chestIds.includes(body.chestId) || !owned.has(body.chestId))) return NextResponse.json({ error: "No tenés ese cofre." }, { status: 403 });
    updates.active_chest = body.chestId;
  }
  if (typeof body?.themeId === "string") {
    if (body.themeId !== "dark" && (!themeIds.includes(body.themeId) || !owned.has(body.themeId))) return NextResponse.json({ error: "No tenés ese tema." }, { status: 403 });
    updates.active_theme = body.themeId;
  }
  if (Object.keys(updates).length === 0) return NextResponse.json({ error: "No hay cambios para guardar." }, { status: 400 });
  const { error } = await client.from("app_users").update(updates).eq("id", user.sub);
  if (error) return NextResponse.json({ error: "No se pudieron guardar los ajustes." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida." }, { status: 401 });
  const { data, error } = await getAdminClient()
    .from("app_users")
    .select("active_glyph_set,active_avatar,active_theme,active_chest,language")
    .eq("id", user.sub)
    .single();
  if (error) return NextResponse.json({ error: "No se pudieron cargar los ajustes." }, { status: 500 });
  return NextResponse.json(data);
}
