"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";

export default function LogoutButton() {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={logout} disabled={loading} className="flex h-9 items-center gap-2 px-2 text-xs text-red-500 transition hover:text-red-400 disabled:opacity-50">
      <LogOut size={16} strokeWidth={1.8} />
      {loading ? t("loggingOut") : t("logout")}
    </button>
  );
}
