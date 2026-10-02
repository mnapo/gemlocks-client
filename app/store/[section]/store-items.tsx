"use client";

import { useState } from "react";
import { Gem } from "lucide-react";
import type { StoreItem } from "@/lib/store/items";

export default function StoreItems({ items, gems: initialGems, owned: initialOwned }: { items: StoreItem[]; gems: number; owned: string[] }) {
  const [gems, setGems] = useState(initialGems);
  const [owned, setOwned] = useState(new Set(initialOwned));
  const [pending, setPending] = useState<StoreItem | null>(null);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  async function purchase() {
    if (!pending) return;
    setBuying(true);
    setError("");
    const res = await fetch("/api/store/purchase", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: pending.id }) });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setError(data?.error ?? "No se pudo completar la compra.");
      setBuying(false);
      return;
    }
    setGems(Number(data.gems));
    setOwned((current) => new Set(current).add(pending.id));
    setPending(null);
    setBuying(false);
  }

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => {
          const isOwned = owned.has(item.id);
          const canBuy = gems >= item.price;
          return (
            <button key={item.id} type="button" disabled={isOwned || !canBuy} onClick={() => { setError(""); setPending(item); }} className={"border p-4 text-left transition " + (isOwned ? "cursor-default border-emerald-500/20 bg-emerald-500/[0.04] opacity-70" : canBuy ? "border-white/10 bg-white/[0.02] hover:border-white/25" : "cursor-not-allowed border-white/10 bg-white/[0.015] opacity-35")}>
              <div className="flex h-20 items-center justify-center text-2xl text-white/65">
                {item.image ? <img src={item.image} alt="" className="h-20 w-20 object-contain" /> : item.preview === "theme-light" ? <span className="h-full w-full border border-white/10 bg-[linear-gradient(135deg,#f5f5f5_0_33%,#d9d9d9_33%_66%,#ffffff_66%)]" /> : item.preview === "theme-pink" ? <span className="h-full w-full border border-white/10 bg-[linear-gradient(135deg,#f5f5f5_0_33%,#e8a0c0_33%_66%,#7d365f_66%)]" /> : item.preview === "theme-ocean" ? <span className="h-full w-full border border-white/10 bg-[linear-gradient(135deg,#e9f8ff_0_33%,#58b9d8_33%_66%,#173b55_66%)]" /> : item.preview ? <span>{item.preview}</span> : <span className="h-full w-full border border-white/10 bg-white/[0.03]" />}
              </div>
              {!item.image && <div className="mt-3 text-sm font-medium">{item.name}</div>}
              <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300/75"><Gem size={13} /> {item.price}</div>
              {isOwned && <div className="mt-2 text-[11px] uppercase tracking-[0.18em] text-emerald-400/70">Adquirido</div>}
            </button>
          );
        })}
      </div>

      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b] px-5">
          <div className="w-full max-w-sm border border-white/10 bg-[#111] p-6">
            <h2 className="text-lg font-medium">¿Está seguro que desea comprar {pending.name}?</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">Después de la compra te quedarán <span className="text-white/80">{gems - pending.price} gemas</span>.</p>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
            <div className="mt-6 flex gap-2">
              <button type="button" disabled={buying} onClick={() => setPending(null)} className="flex-1 border border-white/10 px-4 py-3 text-sm text-white/55 disabled:opacity-30">Cancelar</button>
              <button type="button" disabled={buying} onClick={purchase} className="flex-1 bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{buying ? "Comprando..." : "Comprar"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
