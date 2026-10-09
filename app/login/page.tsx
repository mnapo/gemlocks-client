"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/components/i18n-provider";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
        setError(data.error ?? t("loginError"));
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError(t("connectionError"));
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
          <h1 className="mt-8 text-3xl font-medium tracking-tight">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-white/45">{t("loginSubtitle")}</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30"
            type="email"
            placeholder={t("email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              className="w-full border border-white/10 bg-white/[0.03] px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-white/30 focus:border-white/30"
              type={showPassword ? "text" : "password"}
              placeholder={t("password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="button" aria-label={showPassword ? t("hidePassword") : t("showPassword")} onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-0 flex h-full w-12 items-center justify-center text-white/35 hover:text-white/70">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <p className="pt-1 text-sm text-red-400">{error}</p>}

          <button
            className="mt-2 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={loading}
          >
            {loading ? t("loggingIn") : t("loginTitle")}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/40">
          {t("noAccount")}{" "}
          <Link href="/signup" className="text-white/75 transition hover:text-white">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
