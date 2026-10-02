import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { STORE_SECTIONS } from "@/lib/store/items";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const itemId = String(body?.itemId ?? "");
  const item = Object.values(STORE_SECTIONS).flatMap((section) => section.items).find((entry) => entry.id === itemId);
  if (!item) return NextResponse.json({ error: "Ítem inválido" }, { status: 400 });

  const client = getAdminClient();
  const { data, error } = await client.rpc("purchase_store_item", {
    p_user_id: user.sub,
    p_item_id: item.id,
    p_price: item.price,
  });

  if (error) {
    if (error.message.includes("insufficient_gems")) return NextResponse.json({ error: "No tenés suficientes gemas." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo completar la compra." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, gems: Number(data), itemId: item.id });
}
