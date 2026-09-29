import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import bcrypt from "bcrypt";
import { getAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "gemlocks_session";
const ISSUER = "gemlocks";
const AUDIENCE = "gemlocks-client";
const SESSION_DURATION = "30d";

export function getSessionMaxAge() { return 60 * 60 * 24 * 30; }

export const SESSION_COOKIE = COOKIE_NAME;
export interface SessionUser { sub: string; email: string; name: string; }

function getSecret() {
  const secret = process.env.AUTH_JWT_SECRET;
  if (!secret) throw new Error("Falta AUTH_JWT_SECRET en las variables de entorno.");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { issuer: ISSUER, audience: AUDIENCE });
    return {
      sub: String(payload.sub),
      email: String(payload.email ?? ""),
      name: String(payload.name ?? ""),
    };
  } catch { return null; }
}

export async function validateUserCredentials(email: string, password: string) {
  const supabase = getAdminClient();
  const { data: user, error } = await supabase.from("app_users")
    .select("id,email,name,password_hash")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  if (error || !user || !(await bcrypt.compare(password, user.password_hash))) return null;
  return { sub: user.id, email: user.email, name: user.name };
}

export async function createUser(email: string, password: string, name = "") {
  const supabase = getAdminClient();
  const passwordHash = await bcrypt.hash(password, 12);
  const { data, error } = await supabase.from("app_users")
    .insert({ email: email.trim().toLowerCase(), password_hash: passwordHash, name: name.trim() })
    .select("id,email,name").single();
  if (error) throw error;
  return data;
}

export function payloadToUser(payload: JWTPayload): SessionUser {
  return { sub: String(payload.sub), email: String(payload.email ?? ""), name: String(payload.name ?? "") };
}
