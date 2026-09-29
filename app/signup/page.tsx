"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"signup" | "verify">("signup");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
    } else {
      setStep("verify");
      setMessage("Te enviamos un código de verificación a tu correo.");
    }
    setLoading(false);
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
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
          <h1 className="text-4xl font-semibold tracking-tight">Crear cuenta</h1>
          <p className="mt-2 opacity-65">{step === "signup" ? "Registrate para jugar a Gemlocks." : "Confirmá tu correo."}</p>
        </div>
        {step === "signup" ? (
          <form onSubmit={submit} className="space-y-4">
            <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="email" placeholder="Correo" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none" type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} minLength={6} required />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-xl bg-foreground px-4 py-3 text-background disabled:opacity-50" disabled={loading}>{loading ? "Creando..." : "Crear cuenta"}</button>
          </form>
        ) : (
          <form onSubmit={verify} className="space-y-4">
            <input className="w-full rounded-xl border bg-transparent px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none" inputMode="numeric" maxLength={6} placeholder="000000" value={code} onChange={e => setCode(e.target.value.replace(/\\D/g, "").slice(0, 6))} required />
            {message && <p className="text-sm opacity-70">{message}</p>}
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-xl bg-foreground px-4 py-3 text-background disabled:opacity-50" disabled={loading || code.length !== 6}>{loading ? "Verificando..." : "Verificar correo"}</button>
          </form>
        )}
        <div className="flex items-center gap-3 text-xs opacity-50"><span className="h-px flex-1 bg-current" />o<span className="h-px flex-1 bg-current" /></div>
        <button onClick={google} disabled={loading} className="w-full rounded-xl border px-4 py-3 disabled:opacity-50">Continuar con Google</button>
        <p className="text-center text-sm opacity-70">¿Ya tenés cuenta? <a className="underline" href="/login">Iniciá sesión</a></p>
      </div>
    </main>
  );
}
