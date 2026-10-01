"use client";

import { useEffect, useState } from "react";

type Player = { rank_position:number; name:string; victories:number; defeats:number; draws:number; score:number };

export default function RankingPage() {
  const [players,setPlayers]=useState<Player[]>([]);
  const [page,setPage]=useState(1);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(false);

  useEffect(()=>{
    setLoading(true);
    setError(false);
    fetch(`/api/ranking?page=${page}`)
      .then(r=>{if(!r.ok) throw new Error(); return r.json();})
      .then(d=>setPlayers(d.players))
      .catch(()=>setError(true))
      .finally(()=>setLoading(false));
  },[page]);

  const canNext=players.length===10;

  return <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <header className="border-b border-white/10 py-5">
        <h1 className="text-sm font-medium tracking-tight">ranking</h1>
      </header>
      <section className="flex-1 py-10">
        <h2 className="text-3xl font-medium tracking-tight">Ranking</h2>
        <p className="mt-2 text-sm text-white/35">3 puntos por victoria · 1 por empate</p>
        <div className="mt-8 overflow-hidden border border-white/10">
          <div className="grid grid-cols-[56px_1fr_repeat(4,72px)] border-b border-white/10 px-4 py-3 text-[10px] uppercase tracking-[.15em] text-white/35">
            <span>Puesto</span><span>Jugador</span><span>Vict.</span><span>Der.</span><span>Emp.</span><span>Pts.</span>
          </div>
          {loading ? <div className="px-4 py-12 text-center text-sm text-white/35">Cargando...</div>
          : error ? <div className="px-4 py-12 text-center text-sm text-red-300">No se pudo cargar el ranking.</div>
          : players.length===0 ? <div className="px-4 py-12 text-center text-sm text-white/35">Todavía no hay jugadores.</div>
          : players.map(p=><div key={p.rank_position} className="grid grid-cols-[56px_1fr_repeat(4,72px)] border-b border-white/5 px-4 py-3 text-sm last:border-0"><span className="text-white/45">{p.rank_position}</span><span>{p.name || "Sin nombre"}</span><span>{p.victories}</span><span>{p.defeats}</span><span>{p.draws}</span><span className="font-medium">{p.score}</span></div>)}
        </div>
        <div className="mt-5 flex items-center justify-between">
          <button onClick={()=>setPage(p=>p-1)} disabled={page===1||loading} className="px-3 py-2 text-xs text-white/40 hover:text-white disabled:opacity-20">Atrás</button>
          <span className="text-xs text-white/30">Página {page}</span>
          <button onClick={()=>setPage(p=>p+1)} disabled={!canNext||loading} className="px-3 py-2 text-xs text-white/40 hover:text-white disabled:opacity-20">Siguiente</button>
        </div>
      </section>
    </div>
  </main>;
}
