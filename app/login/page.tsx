"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ email, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "No se pudo iniciar sesión"); return; }
      router.push("/"); router.refresh();
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center p-6"><div className="w-full max-w-sm space-y-6">
    <div><h1 className="text-4xl font-semibold tracking-tight">Iniciar sesión</h1><p className="mt-2 opacity-65">Entrá a Gemlocks.</p></div>
    <form onSubmit={submit} className="space-y-4">
      <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} required />
      <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full rounded-xl bg-foreground px-4 py-3 text-background disabled:opacity-50" disabled={loading}>{loading ? "Ingresando..." : "Iniciar sesión"}</button>
    </form>
    <p className="text-center text-sm opacity-70">¿No tenés cuenta? <a className="underline" href="/signup">Registrate</a></p>
  </div></main>;
}
