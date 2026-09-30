"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, User } from "lucide-react";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";

type Result = { guess: string; perfect: number; regular: number };
type Phase = "setup" | "code-select" | "difficulty" | "coin-toss" | "coin-result" | "player-turn" | "player-result" | "thinking" | "opponent-result" | "final-turn" | "won" | "lost" | "draw";

const phaseTitle: Record<Exclude<Phase, "setup">, string> = {
  "coin-toss": "Tirando la moneda", "coin-result": "Comienza la partida", "player-turn": "Tu turno",
  "player-result": "Resultado del ataque", thinking: "La máquina está pensando",
  "opponent-result": "Resultado del ataque", "final-turn": "Turno final", won: "Ganaste",
  lost: "La máquina ganó", draw: "Empate",
};

function Glyphs({ value }: { value: string }) {
  return <div className="flex gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">{value[index] ? <span className="glyph-fill">{value[index]}</span> : <span className="text-white/15">·</span>}</div>)}</div>;
}

function GlyphSelector({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  function addDigit(digit: string) {
    if (value.length >= 4 || value.includes(digit)) return;
    onChange(value + digit);
  }
  function randomize() {
    const digits = Array.from({ length: 10 }, (_, i) => String(i)).sort(() => Math.random() - 0.5);
    onChange(digits.slice(0, 4).join(""));
  }
  return <div className="mt-5"><div className="flex items-center gap-2"><div className="flex gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">{value[index] ?? <span className="text-white/15">·</span>}</div>)}</div><button type="button" title="Borrar selección" aria-label="Borrar selección" onClick={() => onChange("")} className="ml-1 flex h-10 w-10 items-center justify-center text-red-500 transition hover:text-red-400">⌫</button><button type="button" onClick={randomize} className="h-10 border border-white/10 px-3 text-xs text-white/50 transition hover:border-white/25 hover:text-white">Aleatorio</button></div><div className="mt-5 grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, index) => { const digit = String(index); const used = value.includes(digit); return <button key={digit} type="button" disabled={used || value.length >= 4} onClick={() => addDigit(digit)} className="h-10 border border-white/10 bg-white/[0.02] font-mono text-sm transition hover:border-white/25 disabled:cursor-not-allowed disabled:opacity-20">{digit}</button>; })}</div></div>;
}

function ThinkingGlyphs({ value }: { value: string }) {
  return <div className="flex gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.02] font-mono text-xl">{value[index] ? <span className="glyph-fill">{value[index]}</span> : <span className="thinking-dot h-2.5 w-2.5 rounded-full bg-white/70" />}</div>)}</div>;
}

function Coin() {
  return <div className="relative flex h-64 items-end justify-center"><div className="coin-shadow absolute bottom-8 h-4 w-20 rounded-[50%] bg-yellow-500/70 blur-sm" /><div className="coin-toss relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-700 bg-yellow-400 text-lg font-medium text-yellow-950 shadow-[0_0_35px_rgba(234,179,8,0.15)]"><span>G</span></div></div>;
}

function History({ humanResults, machineResults }: { humanResults: Result[]; machineResults: Result[] }) {
  const [tab, setTab] = useState<"human" | "machine">("human");
  const [page, setPage] = useState(0);
  const results = tab === "human" ? humanResults : machineResults;
  const pageCount = Math.max(1, Math.ceil(results.length / 4));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = [...results].reverse().slice(currentPage * 4, currentPage * 4 + 4);

  function changeTab(next: "human" | "machine") {
    setTab(next);
    setPage(0);
  }

  return <div className="mt-12">
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <div className="text-xs uppercase tracking-[0.25em] text-white/30">Historial</div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Página anterior" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={currentPage === 0} className="text-white/35 transition hover:text-white disabled:opacity-20">‹</button>
        <span className="min-w-5 text-center text-xs text-white/45">{currentPage + 1}</span>
        <button type="button" aria-label="Página siguiente" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={currentPage >= pageCount - 1} className="text-white/35 transition hover:text-white disabled:opacity-20">›</button>
        <button type="button" title="Mis ataques" aria-label="Mis ataques" onClick={() => changeTab("human")} className={"ml-2 flex h-8 w-8 items-center justify-center border transition " + (tab === "human" ? "border-white/30 bg-white/[0.07] text-white" : "border-transparent text-white/30 hover:text-white/70")}><User size={15} strokeWidth={1.8} /></button>
        <button type="button" title="Ataques de la máquina" aria-label="Ataques de la máquina" onClick={() => changeTab("machine")} className={"flex h-8 w-8 items-center justify-center border transition " + (tab === "machine" ? "border-white/30 bg-white/[0.07] text-white" : "border-transparent text-white/30 hover:text-white/70")}><Bot size={15} strokeWidth={1.8} /></button>
      </div>
    </div>
    <div className="divide-y divide-white/10 border-b border-white/10">
      {visible.length === 0 && <div className="py-5 text-sm text-white/25">Todavía no hay ataques.</div>}
      {visible.map((result, index) => <div key={currentPage * 4 + index} className="flex items-center justify-between py-3 text-sm"><span className="font-mono tracking-widest">{result.guess}</span><span className="text-white/45">{result.perfect} perfectos · {result.regular} regulares</span></div>)}
    </div>
  </div>;
}  if (phase === "setup" || phase === "code-select" || phase === "difficulty") return <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]"><div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"><header className="flex items-center justify-between border-b border-white/10 py-5"><Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link><Link href="/" className="text-xs text-white/40 hover:text-white/75">Volver</Link></header><section key={phase} className="phase-enter flex flex-1 flex-col justify-center py-12"><p className="text-xs uppercase tracking-[0.3em] text-white/35">jugador vs máquina</p>{phase === "setup" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Nueva partida</h1><p className="mt-3 text-sm leading-6 text-white/40">Primero elegí tu código secreto.</p><button type="button" onClick={() => setPhase("code-select")} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">Elegir código</button></>}{phase === "code-select" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí tu código</h1><p className="mt-3 text-sm leading-6 text-white/40">El adversario intentará descubrir estos 4 glifos.</p><GlyphSelector value={mySecret} onChange={setMySecret}/><button type="button" onClick={() => setPhase("difficulty")} disabled={mySecret.length !== 4} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">Continuar</button></>}{phase === "difficulty" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí la dificultad</h1><p className="mt-3 text-sm leading-6 text-white/40">Una carrera por descubrir el código secreto del adversario.</p><div className="mt-8 grid gap-2">{DIFFICULTIES.map((option) => { const selected = difficulty === option.level; return <button key={option.level} type="button" onClick={() => setDifficulty(option.level)} className={"flex items-center justify-between border px-4 py-4 text-left transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}><span><span className="block text-sm font-medium">{option.level}. {option.name}</span><span className="mt-1 block text-xs leading-5 text-white/40">{option.description}</span></span><span className={"ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span></button>; })}</div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<button type="button" onClick={startGame} disabled={loading} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-50">{loading ? "Iniciando..." : "Comenzar partida"}</button></>}</section></div></main>;
