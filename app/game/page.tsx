"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";

type Result = { guess: string; perfect: number; regular: number };
type Phase = "setup" | "player-turn" | "player-result" | "thinking" | "opponent-result" | "won" | "lost";

const phaseTitle: Record<Exclude<Phase, "setup">, string> = {
  "player-turn": "Tu turno",
  "player-result": "Resultado",
  thinking: "La máquina está pensando",
  "opponent-result": "Resultado del ataque",
  won: "Ganaste",
  lost: "La máquina ganó",
};

function Glyphs({ value, reveal = true }: { value: string; reveal?: boolean }) {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">
          {reveal && value[index] ? <span className="glyph-fill">{value[index]}</span> : <span className="text-white/15">·</span>}
        </div>
      ))}
    </div>
  );
}

function ThinkingGlyphs() {
  return (
    <div className="flex gap-3">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/10 bg-white/[0.02]">
          <span className="h-2.5 w-2.5 rounded-full bg-white/70" style={{ animation: "glyph-fill .2s ease-out both", animationDelay: index * 180 + "ms" }} />
        </div>
      ))}
    </div>
  );
}

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [phase, setPhase] = useState<Phase>("setup");
  const [guess, setGuess] = useState("");
  const [humanResults, setHumanResults] = useState<Result[]>([]);
  const [machineResults, setMachineResults] = useState<Result[]>([]);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [starter, setStarter] = useState<"human" | "machine">("human");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function startGame() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ difficulty }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error ?? "No se pudo iniciar la partida"); return; }
      setHumanResults([]);
      setMachineResults([]);
      setLastResult(null);
      setGuess("");
      setStarter(data.starter);
      setPhase(data.starter === "human" ? "player-turn" : "thinking");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (guess.length !== 4 || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actor: "human", guess }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
      const result = data.result as Result;
      setHumanResults((current) => [...current, result]);
      setLastResult(result);
      setGuess("");
      setPhase(data.status === "won" ? "won" : "player-result");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (phase !== "thinking") return;
    let active = true;
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/game/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actor: "machine" }) });
        const data = await res.json().catch(() => null);
        if (!active) return;
        if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
        const result = data.result as Result;
        setMachineResults((current) => [...current, result]);
        setLastResult(result);
        setPhase(data.status === "lost" ? "lost" : "opponent-result");
      } catch {
        if (active) setError("Error de conexión. Intentá de nuevo.");
      }
    }, 1800);
    return () => { active = false; window.clearTimeout(timer); };
  }, [phase]);

  function continueAfterPlayerResult() {
    setLastResult(null);
    setPhase("thinking");
  }

  function continueAfterOpponentResult() {
    setLastResult(null);
    setPhase("player-turn");
  }

  if (phase === "setup") {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
          <header className="flex items-center justify-between border-b border-white/10 py-5">
            <Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link>
            <Link href="/" className="text-xs text-white/40 hover:text-white/75">Volver</Link>
          </header>
          <section className="phase-enter flex flex-1 flex-col justify-center py-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">jugador vs máquina</p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí la dificultad</h1>
            <p className="mt-3 text-sm leading-6 text-white/40">Una carrera por descubrir el mismo código secreto.</p>
            <div className="mt-10 grid gap-2">
              {DIFFICULTIES.map((option) => {
                const selected = difficulty === option.level;
                return (
                  <button key={option.level} type="button" onClick={() => setDifficulty(option.level)}
                    className={"flex items-center justify-between border px-4 py-4 text-left transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
                    <span><span className="block text-sm font-medium">{option.level}. {option.name}</span><span className="mt-1 block text-xs leading-5 text-white/40">{option.description}</span></span>
                    <span className={"ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span>
                  </button>
                );
              })}
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <button type="button" onClick={startGame} disabled={loading} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-50">{loading ? "Iniciando..." : "Comenzar partida"}</button>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link>
          <span className="text-xs text-white/40">Nivel {difficulty}</span>
        </header>

        <section key={phase} className="phase-enter flex flex-1 flex-col py-10">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">{starter === "human" ? "vos empezaste" : "la máquina empezó"}</p>
              <h1 className="mt-3 text-3xl font-medium tracking-tight">{phaseTitle[phase as Exclude<Phase, "setup">]}</h1>
            </div>
            <div className="text-right text-xs text-white/30">
              <div>{humanResults.length} ataques tuyos</div>
              <div>{machineResults.length} de la máquina</div>
            </div>
          </div>

          {phase === "player-turn" && (
            <>
              <div className="mt-10">
                <p className="text-sm text-white/45">Elegí 4 glifos distintos para atacar.</p>
                <form onSubmit={submitGuess} className="mt-5">
                  <div className="flex gap-3">
                    <input autoFocus inputMode="numeric" maxLength={4} value={guess}
                      onChange={(event) => setGuess(event.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="1234"
                      className="min-w-0 flex-1 border border-white/10 bg-white/[0.03] px-4 py-4 text-xl tracking-[0.35em] outline-none focus:border-white/30" />
                    <button disabled={loading || guess.length !== 4} className="bg-[#f5f5f5] px-7 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">Atacar</button>
                  </div>
                </form>
                {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
              </div>
              <History title="Historial" results={humanResults} />
            </>
          )}

          {phase === "player-result" && lastResult && (
            <ResultPanel result={lastResult} label="Tu ataque" action="Continuar" onAction={continueAfterPlayerResult} />
          )}

          {phase === "thinking" && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ThinkingGlyphs />
              <div className="mt-7 flex gap-2">
                <span className="thinking-dot h-3 w-3 rounded-full bg-white/80" />
                <span className="thinking-dot h-3 w-3 rounded-full bg-white/80" />
                <span className="thinking-dot h-3 w-3 rounded-full bg-white/80" />
              </div>
              <p className="mt-5 text-sm text-white/40">Analizando posibilidades...</p>
            </div>
          )}

          {phase === "opponent-result" && lastResult && (
            <ResultPanel result={lastResult} label="Ataque de la máquina" action="Tu turno" onAction={continueAfterOpponentResult} />
          )}

          {(phase === "won" || phase === "lost") && (
            <div className="phase-enter flex flex-1 flex-col items-center justify-center text-center">
              <div className="text-xs uppercase tracking-[0.3em] text-white/35">partida terminada</div>
              <h2 className="mt-4 text-4xl font-medium">{phaseTitle[phase]}</h2>
              <p className="mt-3 text-sm text-white/40">{phase === "won" ? "Descubriste el código antes que la máquina." : "La máquina descubrió el código antes que vos."}</p>
              <button type="button" onClick={() => { setPhase("setup"); setError(""); }} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Nueva partida</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function History({ title, results }: { title: string; results: Result[] }) {
  return (
    <div className="mt-12">
      <div className="text-xs uppercase tracking-[0.25em] text-white/30">{title}</div>
      <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
        {results.length === 0 && <div className="py-5 text-sm text-white/25">Todavía no hay ataques.</div>}
        {results.map((result, index) => (
          <div key={index} className="flex items-center justify-between py-3 text-sm">
            <span className="font-mono tracking-widest">{result.guess}</span>
            <span className="text-white/45">{result.perfect} perfectos · {result.regular} regulares</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ result, label, action, onAction }: { result: Result; label: string; action: string; onAction: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="border border-white/10 bg-white/[0.02] p-7 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p>
        <div className="mt-7 flex justify-center"><Glyphs value={result.guess} /></div>
        <div className="mt-8 grid grid-cols-2 border-t border-white/10 pt-6">
          <div><div className="text-3xl font-medium">{result.perfect}</div><div className="mt-1 text-xs text-white/35">perfectos</div></div>
          <div><div className="text-3xl font-medium">{result.regular}</div><div className="mt-1 text-xs text-white/35">regulares</div></div>
        </div>
      </div>
      <button type="button" onClick={onAction} className="mt-6 bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">{action}</button>
    </div>
  );
}
