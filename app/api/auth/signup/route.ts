import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, getSessionMaxAge, SESSION_COOKIE, createUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }
  if (!body.email || !body.password) return NextResponse.json({ error: "Email y contraseña son obligatorios" }, { status: 400 });
  if (body.password.length < 6) return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  try {
    const user = await createUser(body.email, body.password, body.name);
    const token = await createSessionToken(user);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: getSessionMaxAge() });
    return res;
  } catch (error: any) {
    if (error?.code === "23505") return NextResponse.json({ error: "El correo ya está registrado" }, { status: 409 });
    return NextResponse.json({ error: "No se pudo crear la cuenta" }, { status: 500 });
  }
}
