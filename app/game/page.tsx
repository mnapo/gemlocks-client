"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";

type Result = { guess: string; perfect: number; regular: number };
type Status = "setup" | "playing" | "won" | "lost";

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [status, setStatus] = useState<Status>("setup");
  const [guess, setGuess] = useState("");
  const [humanResults, setHumanResults] = useState<Result[]>([]);
  const [machineResult, setMachineResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function startGame() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo iniciar la partida");
        return;
      }
      setHumanResults([]);
      setMachineResult(null);
      setGuess("");
      setStatus("playing");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function submitGuess(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo procesar el intento");
        return;
      }
      setHumanResults((current) => [...current, data.human]);
      setMachineResult(data.machine);
      setGuess("");
      setStatus(data.status);
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (status === "setup") {
    return (
      <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
          <header className="flex items-center justify-between border-b border-white/10 py-5">
            <Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link>
            <Link href="/" className="text-xs text-white/40 transition hover:text-white/75">Volver</Link>
          </header>
          <section className="flex flex-1 flex-col justify-center py-12">
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">jugador vs máquina</p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí la dificultad</h1>
            <p className="mt-3 text-sm leading-6 text-white/40">Cinco niveles para definir cómo juega la máquina.</p>
            <div className="mt-10 grid gap-2">
              {DIFFICULTIES.map((option) => {
                const selected = difficulty === option.level;
                return (
                  <button key={option.level} type="button" onClick={() => setDifficulty(option.level)}
                    className={"flex items-center justify-between border px-4 py-4 text-left transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
                    <span>
                      <span className="block text-sm font-medium">{option.level}. {option.name}</span>
                      <span className="mt-1 block text-xs leading-5 text-white/40">{option.description}</span>
                    </span>
                    <span className={"ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
            <button type="button" onClick={startGame} disabled={loading}
              className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white disabled:opacity-50">
              {loading ? "Iniciando..." : "Comenzar partida"}
            </button>
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
        <section className="flex-1 py-10">
          <div className="border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">tu código</p>
            <p className="mt-2 text-sm text-white/50">Pensá un código de 4 dígitos únicos. La máquina intentará descubrirlo.</p>
          </div>
          <form onSubmit={submitGuess} className="mt-8">
            <label className="text-xs text-white/40">Tu intento</label>
            <div className="mt-2 flex gap-2">
              <input inputMode="numeric" maxLength={4} pattern="[0-9]{4}" value={guess}
                onChange={(event) => setGuess(event.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="min-w-0 flex-1 border border-white/10 bg-white/[0.03] px-4 py-3 text-lg tracking-[0.35em] outline-none focus:border-white/30"
                disabled={loading || status === "won" || status === "lost"} />
              <button disabled={loading || guess.length !== 4 || status === "won" || status === "lost"}
                className="bg-[#f5f5f5] px-6 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">
                {loading ? "..." : "Probar"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
          </form>
          <div className="mt-10">
            <div className="flex items-center justify-between text-xs text-white/35"><span>Tus intentos</span><span>{humanResults.length}</span></div>
            <div className="mt-3 divide-y divide-white/10 border-y border-white/10">
              {humanResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between py-3 text-sm">
                  <span className="font-mono tracking-widest">{result.guess}</span>
                  <span className="text-white/50">{result.perfect} perfectos · {result.regular} regulares</span>
                </div>
              ))}
            </div>
          </div>
          {machineResult && (
            <div className="mt-8 border border-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/35">último intento de la máquina</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-mono text-lg tracking-widest">{machineResult.guess}</span>
                <span className="text-sm text-white/50">{machineResult.perfect} perfectos · {machineResult.regular} regulares</span>
              </div>
            </div>
          )}
          {(status === "won" || status === "lost") && (
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-medium">{status === "won" ? "Ganaste." : "La máquina encontró tu código."}</h2>
              <p className="mt-2 text-sm text-white/40">{status === "won" ? "Descubriste el código secreto." : "Podés volver a jugar con otra dificultad."}</p>
              <button type="button" onClick={() => setStatus("setup")} className="mt-6 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Nueva partida</button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
