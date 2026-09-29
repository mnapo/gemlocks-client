"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ? "No se pudo completar la autenticación." : "");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push("/");
    setLoading(false);
  }

  async function google() {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 opacity-65">Entrá a Gemlocks.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
          <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-xl bg-foreground px-4 py-3 text-background disabled:opacity-50" disabled={loading}>{loading ? "Ingresando..." : "Iniciar sesión"}</button>
        </form>
        <div className="flex items-center gap-3 text-xs opacity-50"><span className="h-px flex-1 bg-current" />o<span className="h-px flex-1 bg-current" /></div>
        <button onClick={google} disabled={loading} className="w-full rounded-xl border px-4 py-3 disabled:opacity-50">Continuar con Google</button>
        <p className="text-center text-sm opacity-70">¿No tenés cuenta? <a className="underline" href="/signup">Registrate</a></p>
      </div>
    </main>
  );
}
