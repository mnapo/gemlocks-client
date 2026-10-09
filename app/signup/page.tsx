"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

const USERNAME_RE = /^[a-z][a-z0-9]{3,15}$/;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;

function usernameError(value: string, t: (key: TranslationKey) => string) {
  if (!value) return t("usernameRequired");
  if (value.length < 4) return t("usernameMin");
  if (value.length > 16) return t("usernameMax");
  if (!/^[a-z]/.test(value)) return t("usernameStart");
  if (!/^[a-z0-9]+$/.test(value)) return t("usernameChars");
  return "";
}

function passwordError(value: string, t: (key: TranslationKey) => string) {
  if (!value) return t("passwordRequired");
  if (value.length < PASSWORD_MIN) return t("passwordMin");
  if (value.length > PASSWORD_MAX) return t("passwordMax");
  if (/\s/.test(value)) return t("passwordSpaces");
  if (!/[a-zA-Z]/.test(value)) return t("passwordLetter");
  if (!/[0-9]/.test(value)) return t("passwordNumber");
  return "";
}

export default function SignupPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const normalizedName = name.toLowerCase();
  const nameError = useMemo(() => usernameError(normalizedName, t), [normalizedName, t]);
  const passError = useMemo(() => passwordError(password, t), [password, t]);
  const formError = serverError || nameError || passError;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setServerError("");
    if (nameError || passError || !email.trim()) {
      setServerError(!email.trim() ? t("emailRequired") : "");
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
        setServerError(data.error ?? t("signupError"));
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setServerError(t("connectionError"));
    } finally {
      setLoading(false);
    }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-[#f5f5f5]">
    <div className="w-full max-w-sm">
      <div className="mb-10">
        <h1 className="text-3xl font-medium tracking-tight">{t("createAccount")}</h1>
        <p className="mt-2 text-sm text-white/45">{t("signupSubtitle")}</p>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type="text" placeholder={t("username")} value={name} onChange={e => { setName(e.target.value.toLowerCase()); setServerError(""); }} autoComplete="username" />
          <p className="mt-1 text-xs text-white/30">{t("usernameHint")}</p>
          {name && nameError && <p className="mt-1 text-xs text-red-400">{nameError}</p>}
        </div>
        <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type="email" placeholder={t("email")} value={email} onChange={e => { setEmail(e.target.value); setServerError(""); }} autoComplete="email" required />
        <div>
          <div className="relative">
            <input className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30" type={showPassword ? "text" : "password"} placeholder={t("password")} value={password} onChange={e => { setPassword(e.target.value); setServerError(""); }} autoComplete="new-password" />
            <button type="button" aria-label={showPassword ? t("hidePassword") : t("showPassword")} onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/35 hover:text-white/70">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="mt-1 text-xs text-white/30">{t("passwordHint")}</p>
          {password && passError && <p className="mt-1 text-xs text-red-400">{passError}</p>}
        </div>
        {serverError && !nameError && !passError && <p className="text-sm text-red-400">{serverError}</p>}
        <button className="mt-2 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50" disabled={loading || !!nameError || !!passError || !email.trim()}>{loading ? t("creating") : t("createAccount")}</button>
      </form>
    </div>
  </main>;
}