import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, SESSION_COOKIE, createUser } from "@/lib/auth";

const USERNAME_RE = /^[a-z][a-z0-9]{3,15}$/;
const PASSWORD_RE = /^(?=.*[A-Za-z])(?=.*\d)\S{8,64}$/;

export function getSessionMaxAge() { return 60 * 60 * 24 * 30; }

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string; name?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const name = body.name?.trim().toLowerCase();

  if (!email || !name || !body.password) return NextResponse.json({ error: "Nombre de usuario, email y contraseña son obligatorios." }, { status: 400 });
  if (!USERNAME_RE.test(name)) return NextResponse.json({ error: "El nombre de usuario debe tener 4–16 caracteres, comenzar con una letra y contener solo letras minúsculas y números." }, { status: 400 });
  if (!PASSWORD_RE.test(body.password)) return NextResponse.json({ error: "La contraseña debe tener 8–64 caracteres, al menos una letra y un número, y no puede contener espacios." }, { status: 400 });

  try {
    const user = await createUser(email, body.password, name);
    const token = await createSessionToken(user);
    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: getSessionMaxAge() });
    return res;
  } catch (error: any) {
    if (error?.code === "23505") {
      const detail = String(error?.detail ?? "");
      return NextResponse.json({ error: detail.includes("name") || detail.includes("app_users_name_unique_idx") ? "Ese nombre de usuario ya está en uso." : "El correo ya está registrado." }, { status: 409 });
    }
    return NextResponse.json({ error: "No se pudo crear la cuenta." }, { status: 500 });
  }
}