"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";

type Player = {
  rank_position: number;
  id: string;
  name: string | null;
  active_avatar: string | null;
  level: number;
  coins: number;
  victories: number;
  defeats: number;
  draws: number;
  score: number;
};

export default function RankingPage() {
  const { t } = useI18n();
  const [players, setPlayers] = useState<Player[]>([]);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    fetch(`/api/ranking?page=${page}`)
      .then((response) => {
        if (!response.ok) throw new Error("Ranking request failed");
        return response.json();
      })
      .then((data) => {
        setPlayers(data.players);
        setHasNextPage(data.hasNextPage);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-3 text-[#f5f5f5] sm:px-6">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <a href="/" className="text-xs text-white/40 transition hover:text-white">{t("back")}</a>
          <h1 className="text-sm font-medium tracking-tight">ranking</h1>
        </header>
        <section className="flex-1 py-8 sm:py-10">
          <h2 className="text-3xl font-medium tracking-tight">{t("ranking")}</h2>
          <p className="mt-2 text-sm text-white/35">{t("rankPoints")}</p>
          <div className="mt-8 overflow-hidden border border-white/10">
            <div className="grid grid-cols-[26px_minmax(0,1fr)_30px_30px_30px_38px] gap-1 border-b border-white/10 px-2 py-3 text-[8px] uppercase tracking-wider text-white/35 sm:grid-cols-[56px_minmax(160px,1fr)_repeat(4,72px)] sm:gap-0 sm:px-4 sm:text-[10px] sm:tracking-[.15em]">
              <span>#</span><span>{t("nickname")}</span>
              <span className="text-center sm:text-left">{t("victories")}</span>
              <span className="text-center sm:text-left">{t("defeats")}</span>
              <span className="text-center sm:text-left">{t("draws")}</span>
              <span className="text-right sm:text-left">{t("points")}</span>
            </div>
            {loading ? (
              <div className="px-4 py-12 text-center text-sm text-white/35">{t("loading")}</div>
            ) : error ? (
              <div className="px-4 py-12 text-center text-sm text-red-300">{t("rankingError")}</div>
            ) : players.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-white/35">{t("noPlayers")}</div>
            ) : players.map((player) => (
              <div key={player.id} className="grid grid-cols-[26px_minmax(0,1fr)_30px_30px_30px_38px] items-center gap-1 border-b border-white/5 px-2 py-3 text-xs last:border-0 sm:grid-cols-[56px_minmax(160px,1fr)_repeat(4,72px)] sm:gap-0 sm:px-4 sm:text-sm">
                <span className="text-white/45">{player.rank_position}</span>
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={player.active_avatar ? `/store/avatars/${player.active_avatar.replace("avatar-", "")}.svg` : "/store/avatars/predeterminado.svg"} alt="" className="h-7 w-7 shrink-0 rounded-full object-contain sm:h-8 sm:w-8" />
                    <span className="truncate text-[11px] sm:text-sm">{player.name || "Sin nombre"}</span>
                  </div>
                  <div className="mt-1 pl-9 text-[9px] leading-tight text-white/40 sm:pl-10 sm:text-[10px]">
                    <span>Lv. {player.level}</span><span className="mx-1.5 text-white/20">·</span><span>{player.coins.toLocaleString()} {t("coins")}</span>
                  </div>
                </div>
                <span className="text-center tabular-nums sm:text-left">{player.victories}</span>
                <span className="text-center tabular-nums sm:text-left">{player.defeats}</span>
                <span className="text-center tabular-nums sm:text-left">{player.draws}</span>
                <span className="text-right font-medium tabular-nums sm:text-left">{player.score}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <button onClick={() => setPage((current) => current - 1)} disabled={page === 1 || loading} className="px-3 py-2 text-xs text-white/40 hover:text-white disabled:opacity-20">{t("backPage")}</button>
            <span className="text-xs text-white/30">{t("page")} {page}</span>
            <button onClick={() => setPage((current) => current + 1)} disabled={!hasNextPage || loading} className="px-3 py-2 text-xs text-white/40 hover:text-white disabled:opacity-20">{t("nextPage")}</button>
          </div>
        </section>
      </div>
    </main>
  );
}
