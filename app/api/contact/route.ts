import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase/admin";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const kinds = new Set(["reporte", "sugerencia", "asistencia", "solicitud"]);

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) return NextResponse.json({ error: "Iniciá sesión para enviar un mensaje." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const kind = String(body?.kind ?? "");
  const message = String(body?.message ?? "").trim();
  if (!kinds.has(kind) || message.length < 5 || message.length > 2000) {
    return NextResponse.json({ error: "Revisá el tipo y el mensaje (entre 5 y 2000 caracteres)." }, { status: 400 });
  }

  const localDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date());
  const { error } = await getAdminClient().from("contact_messages").insert({
    user_id: user.sub, kind, message, local_date: localDate,
  });
  if (error?.code === "23505") return NextResponse.json({ error: "Ya enviaste un mensaje hoy. Podés volver a escribir mañana." }, { status: 429 });
  if (error) return NextResponse.json({ error: "No se pudo guardar el mensaje." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
