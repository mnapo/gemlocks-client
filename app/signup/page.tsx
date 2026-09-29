"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/signup", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, password, name }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo crear la cuenta"); return; }
      router.push("/"); router.refresh();
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-sm space-y-6">
    <div><h1 className="text-4xl font-semibold tracking-tight">Crear cuenta</h1><p className="mt-2 opacity-65">Registrate para jugar a Gemlocks.</p></div>
    <form onSubmit={submit} className="space-y-4">
      <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="text" placeholder="Nombre" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} minLength={6} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded-xl bg-foreground px-4 py-3 text-background disabled:opacity-50" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
    </form>
    <p className="text-center text-sm opacity-70">¿Ya tenés cuenta? <a className="underline" href="/login">Iniciá sesión</a></p>
  </div></main>;
}
