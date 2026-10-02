"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const USERNAME_RE = /^[a-z][a-z0-9]{3,15}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;

function usernameError(value: string) {
  if (!value) return "El nombre de usuario es obligatorio.";
  if (value.length < 4) return "Debe tener al menos 4 caracteres.";
  if (value.length > 16) return "Debe tener como máximo 16 caracteres.";
  if (!/^[a-z]/.test(value)) return "Debe comenzar con una letra.";
  if (!/^[a-z0-9]+$/.test(value)) return "Solo puede contener letras minúsculas y números.";
  return "";
}

function passwordError(value: string) {
  if (!value) return "La contraseña es obligatoria.";
  if (value.length < PASSWORD_MIN) return "Debe tener al menos 8 caracteres.";
  if (value.length > PASSWORD_MAX) return "Debe tener como máximo 64 caracteres.";
  if (/\s/.test(value)) return "No puede contener espacios.";
  if (!/[a-zA-Z]/.test(value)) return "Debe contener al menos una letra.";
  if (!/[0-9]/.test(value)) return "Debe contener al menos un número.";
  return "";
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const normalizedName = name.toLowerCase();
  const nameError = useMemo(() => usernameError(normalizedName), [normalizedName]);
  const passError = useMemo(() => passwordError(password), [password]);
  const formError = serverError || nameError || passError;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setServerError("");
    if (nameError || passError || !email.trim()) {
      setServerError(!email.trim() ? "El correo es obligatorio." : "");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: normalizedName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "No se pudo crear la cuenta.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setServerError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-[#f5f5f5]">
    <div className="w-full max-w-sm">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight">Crear cuenta</h1>
        <p className="mt-2 text-sm text-white/45">Registrate para jugar a Gemlocks.</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type="text" placeholder="Nombre de usuario" value={name} onChange={e => { setName(e.target.value.toLowerCase()); setServerError(""); }} autoComplete="username" />
          <p className="mt-1 text-xs text-white/30">4–16 caracteres · empieza con letra · solo letras minúsculas y números</p>
          {name && nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
        </div>
        <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type="email" placeholder="Correo" value={email} onChange={e => { setEmail(e.target.value); setServerError(""); }} autoComplete="email" required />
        <div>
          <div className="relative">
            <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type={showPassword ? "text" : "password"} placeholder="Contraseña" value={password} onChange={e => { setPassword(e.target.value); setServerError(""); }} autoComplete="new-password" />
            <button type="button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/35 hover:text-white/70">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-white/30">8–64 caracteres · al menos una letra y un número · sin espacios</p>
          {password && passError && <p className="mt-1 text-xs text-red-400">{passError}</p>}
        </div>
        {serverError && !nameError && !passError && <p className="text-sm text-red-400">{serverError}</p>}
        <button className="mt-2 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || !!nameError || !!passError || !email.trim()}>{loading ? "Creando..." : "Crear cuenta"}</button>
      </form>
    </div>
  </main>;
}