"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="w-full max-w-sm">
        <div className="mb-10">
          <Link href="/" className="text-sm text-white/45 transition hover:text-white/80">
            gemlocks
          </Link>
          <h1 className="mt-8 text-3xl font-medium tracking-tight">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-white/45">Entrá para jugar.</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30"
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="pt-1 text-sm text-red-400">{error}</p>}

          <button
            className="mt-2 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/40">
          ¿No tenés cuenta?{" "}
          <Link href="/signup" className="text-white/75 transition hover:text-white">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
