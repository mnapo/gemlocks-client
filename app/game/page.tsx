"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Check, Trash2, User, X } from "lucide-react";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";

type Result = { guess: string; perfect: number; regular: number };
type Phase = "setup" | "code-select" | "difficulty" | "coin-toss" | "coin-result" | "player-turn" | "player-result" | "thinking" | "opponent-result" | "final-turn" | "won" | "lost" | "draw";

const phaseTitle: Record<Exclude<Phase, "setup">, string> = {
  "code-select": "Elegí tu código", "difficulty": "Elegí la dificultad", "coin-toss": "Tirando la moneda", "coin-result": "Comienza la partida", "player-turn": "Tu turno",
  "player-result": "Resultado del ataque", thinking: "La máquina está pensando",
  "opponent-result": "Resultado del ataque", "final-turn": "Turno final", won: "Ganaste",
  lost: "La máquina ganó", draw: "Empate",
};

function Glyphs({ value }: { value: string }) {
  return <div className="flex gap-3">{Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">{value[index] ? <span className="glyph-fill">{value[index]}</span> : <span className="text-white/15">·</span>}</div>)}</div>;
}

function GlyphSelector({
  value,
  onChange,
  discardMode = false,
  onToggleDiscard,
  discarded = new Set<string>(),
  onDiscard,
}: {
  value: string;
  onChange: (value: string) => void;
  discardMode?: boolean;
  onToggleDiscard?: () => void;
  onDiscard?: (digit: string) => void;
  discarded?: Set<string>;
}) {
  function addDigit(digit: string) {
    if (discardMode) {
      if (discarded.has(digit)) {
        onDiscard?.(digit);
        return;
      }
      onChange(value.replaceAll(digit, ""));
      onDiscard?.(digit);
      return;
    }
    if (discarded.has(digit) || value.length >= 4 || value.includes(digit)) return;
    onChange(value + digit);
  }

  function randomize() {
    const available = Array.from({ length: 10 }, (_, i) => String(i)).filter((digit) => !discarded.has(digit));
    if (available.length < 4) return;
    onChange(available.sort(() => Math.random() - 0.5).slice(0, 4).join(""));
  }

  return <div className="mt-5">
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="flex gap-3">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">{value[index] ?? <span className="text-white/15">·</span>}</div>)}
        </div>
        <button type="button" title="Borrar selección" aria-label="Borrar selección" onClick={() => onChange("")} className="ml-1 flex h-10 w-10 items-center justify-center text-red-500 transition hover:text-red-400"><Trash2 size={17} strokeWidth={2.2} /></button>
        <button type="button" onClick={randomize} disabled={discarded.size > 6} className="h-10 border border-white/10 px-3 text-xs text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-20">Aleatorio</button>
      </div>
      {onToggleDiscard && <button type="button" onClick={onToggleDiscard} className={"flex h-10 items-center gap-1.5 border px-4 text-xs transition " + (discardMode ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-400" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white")}>{discardMode && <Check size={14} strokeWidth={2} />}{discardMode ? "Listo" : "Descartar"}</button>}
    </div>
    {discardMode && <div className="mb-2 border border-white/10 px-3 py-2 text-xs text-white/45">Seleccioná qué glifos querés descartar:</div>}<div className="mt-5 grid grid-cols-5 gap-2">
      {Array.from({ length: 10 }, (_, index) => {
        const digit = String(index);
        const used = value.includes(digit);
        const isDiscarded = discarded.has(digit);
        return <button key={digit} type="button" disabled={!discardMode && (isDiscarded || used || value.length >= 4)} onClick={() => addDigit(digit)} className={"relative h-10 border font-mono text-sm transition " + (isDiscarded ? "border-red-500/25 text-red-500/70" : "border-white/10 bg-white/[0.02] hover:border-white/25") + (discardMode && !isDiscarded ? " border-emerald-500/30 hover:border-emerald-400/60" : "") + ((!discardMode && (isDiscarded || used || value.length >= 4)) ? " cursor-not-allowed opacity-20" : "")}>
          <span className={"relative inline-flex " + (isDiscarded ? "text-red-400" : "")}>{digit}{isDiscarded && <X className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-40" size={22} strokeWidth={2.5} />}</span>
        </button>;
      })}
    </div>
  </div>;
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
  function changeTab(next: "human" | "machine") { setTab(next); setPage(0); }
  return <div className="mt-12">
    <div className="flex items-center justify-between border-b border-white/10 pb-3">
      <div className="text-xs uppercase tracking-[0.25em] text-white/30">Historial</div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label="Página anterior" onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={currentPage === 0} className="text-white/35 hover:text-white disabled:opacity-20">‹</button>
        <span className="min-w-5 text-center text-xs text-white/45">{currentPage + 1}</span>
        <button type="button" aria-label="Página siguiente" onClick={() => setPage((v) => Math.min(pageCount - 1, v + 1))} disabled={currentPage >= pageCount - 1} className="text-white/35 hover:text-white disabled:opacity-20">›</button>
        <button type="button" title="Mis ataques" aria-label="Mis ataques" onClick={() => changeTab("human")} className={"ml-2 flex h-8 w-8 items-center justify-center border " + (tab === "human" ? "border-white/30 bg-white/[0.07] text-white" : "border-transparent text-white/30")}><User size={15} strokeWidth={1.8} /></button>
        <button type="button" title="Ataques de la máquina" aria-label="Ataques de la máquina" onClick={() => changeTab("machine")} className={"flex h-8 w-8 items-center justify-center border " + (tab === "machine" ? "border-white/30 bg-white/[0.07] text-white" : "border-transparent text-white/30")}><Bot size={15} strokeWidth={1.8} /></button>
      </div>
    </div>
    <div className="divide-y divide-white/10 border-b border-white/10">
      {visible.length === 0 && <div className="py-5 text-sm text-white/25">Todavía no hay ataques.</div>}
      {visible.map((result, index) => <div key={currentPage * 4 + index} className="flex items-center justify-between py-3 text-sm"><span className="font-mono tracking-widest">{result.guess}</span><span className="text-white/45">{result.perfect} perfectos · {result.regular} regulares</span></div>)}
    </div>
  </div>;
}
function ResultPanel({ result, label, action, onAction }: { result: Result; label: string; action: string; onAction: () => void }) {
  return <div className="flex flex-1 flex-col justify-center"><div className="border border-white/10 bg-white/[0.02] p-7 text-center"><p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p><div className="mt-7 flex justify-center"><Glyphs value={result.guess} /></div><div className="mt-8 grid grid-cols-2 border-t border-white/10 pt-6"><div><div className="text-3xl font-medium">{result.perfect}</div><div className="mt-1 text-xs text-white/35">perfectos</div></div><div><div className="text-3xl font-medium">{result.regular}</div><div className="mt-1 text-xs text-white/35">regulares</div></div></div></div><button type="button" onClick={onAction} className="mt-6 bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">{action}</button></div>;
}

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [phase, setPhase] = useState<Phase>("setup");
  const [guess, setGuess] = useState("");
  const [mySecret, setMySecret] = useState("");
  const [machineReveal, setMachineReveal] = useState("");
  const [humanResults, setHumanResults] = useState<Result[]>([]);
  const [machineResults, setMachineResults] = useState<Result[]>([]);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [starter, setStarter] = useState<"human" | "machine">("human");
  const [finalActor, setFinalActor] = useState<"human" | "machine" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [discarded, setDiscarded] = useState<Set<string>>(new Set());

  async function startGame() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/game/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ difficulty, humanSecret: mySecret }) });
      const data = await res.json().catch(() => null);
      if (!res.ok) { setError(data?.error ?? "No se pudo iniciar la partida"); return; }
      setHumanResults([]); setMachineResults([]); setLastResult(null); setGuess(""); setMySecret(data.humanSecret ?? mySecret); setFinalActor(null); setDiscardMode(false);
      setStarter(data.starter); setPhase("coin-toss");
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (phase !== "coin-toss") return;
    const timer = window.setTimeout(() => setPhase("coin-result"), 2350);
    return () => window.clearTimeout(timer);
  }, [phase]);

  async function attack(actor: "human" | "machine", value?: string) {
    const res = await fetch("/api/game/turn", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actor, guess: value }) });
    return { res, data: await res.json().catch(() => null) };
  }

  async function submitGuess(event: FormEvent) {
    event.preventDefault();
    if (guess.length !== 4 || loading) return;
    setLoading(true); setError("");
    try {
      const { res, data } = await attack("human", guess);
      if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
      const result = data.result as Result;
      setHumanResults((current) => [...current, result]); setLastResult(result); setGuess(""); setDiscardMode(false);
      if (data.status === "final-turn") { setFinalActor(data.finalActor); setPhase("final-turn"); }
      else setPhase(data.status === "won" ? "won" : "player-result");
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (phase !== "thinking") return;
    let active = true;
    setMachineReveal("");
    const timer = window.setTimeout(async () => {
      try {
        const { res, data } = await attack("machine");
        if (!active) return;
        if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
        const machineGuess = String(data.machineGuess ?? "");
        for (let index = 0; index < machineGuess.length; index++) {
          await new Promise((resolve) => window.setTimeout(resolve, 550));
          if (!active) return;
          setMachineReveal(machineGuess.slice(0, index + 1));
        }
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        if (!active) return;
        const result = data.result as Result;
        setMachineResults((current) => [...current, result]); setLastResult(result);
        if (data.status === "final-turn") { setFinalActor(data.finalActor); setPhase("final-turn"); }
        else setPhase(data.status === "lost" ? "lost" : "opponent-result");
      } catch { if (active) setError("Error de conexión. Intentá de novo."); }
    }, 1200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [phase]);

  function beginMatch() { setPhase(starter === "human" ? "player-turn" : "thinking"); }
  function continueAfterPlayerResult() { setLastResult(null); setPhase("thinking"); }
  function continueAfterOpponentResult() { setLastResult(null); setPhase("player-turn"); }
  function beginFinalTurn() { setLastResult(null); setPhase(finalActor === "human" ? "player-turn" : "thinking"); }

  if (phase === "setup" || phase === "code-select" || phase === "difficulty") return <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]"><div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"><header className="flex items-center justify-between border-b border-white/10 py-5"><Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link><Link href="/" className="text-xs text-white/40 hover:text-white/75">Volver</Link></header><section key={phase} className="phase-enter flex flex-1 flex-col justify-center py-12"><p className="text-xs uppercase tracking-[0.3em] text-white/35">jugador vs máquina</p>{phase === "setup" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Nueva partida</h1><p className="mt-3 text-sm leading-6 text-white/40">Primero elegí la configuración de la partida.</p><button type="button" onClick={() => setPhase("difficulty")} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">Continuar</button></>}{phase === "code-select" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí tu código</h1><p className="mt-3 text-sm leading-6 text-white/40">El adversario intentará descubrir estos 4 glifos.</p><GlyphSelector value={mySecret} onChange={setMySecret}/><button type="button" onClick={startGame} disabled={loading || mySecret.length !== 4} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{loading ? "Iniciando..." : "Comenzar partida"}</button></>}{phase === "difficulty" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí la dificultad</h1><p className="mt-3 text-sm leading-6 text-white/40">Una carrera por descubrir el código secreto del adversario.</p><div className="mt-8 grid gap-2">{DIFFICULTIES.map((option) => { const selected = difficulty === option.level; return <button key={option.level} type="button" onClick={() => setDifficulty(option.level)} className={"flex items-center justify-between border px-4 py-4 text-left transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}><span><span className="block text-sm font-medium">{option.level}. {option.name}</span><span className="mt-1 block text-xs leading-5 text-white/40">{option.description}</span></span><span className={"ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span></button>; })}</div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<button type="button" onClick={() => setPhase("code-select")} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">Seleccionar</button></>}</section></div></main>;

  const inMatch = !["coin-toss", "coin-result"].includes(phase);
  return <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]"><div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"><header className="flex items-center justify-between border-b border-white/10 py-5"><Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link><span className="text-xs text-white/40">Nivel {difficulty}</span></header><section key={phase} className="phase-enter flex flex-1 flex-col py-10">
    {!inMatch && phase === "coin-toss" && <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="text-xs uppercase tracking-[0.3em] text-white/35">sorteo</p><h1 className="mt-4 text-3xl font-medium">¿Quién empieza?</h1><Coin /></div>}
    {!inMatch && phase === "coin-result" && <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="text-xs uppercase tracking-[0.3em] text-white/35">sorteo terminado</p><h1 className="mt-4 text-3xl font-medium">{starter === "human" ? "Empezás vos." : "Empieza la máquina."}</h1><p className="mt-4 text-sm text-white/40">{starter === "human" ? "Tenés el primer ataque." : "La máquina tiene el primer ataque."}</p><button type="button" onClick={beginMatch} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Comenzar</button></div>}
    {inMatch && <><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-white/35">{starter === "human" ? "vos empezaste" : "la máquina empezó"}</p><h1 className="mt-3 text-3xl font-medium tracking-tight">{phaseTitle[phase as Exclude<Phase, "setup">]}</h1></div><div className="text-right text-xs text-white/30"><div>Tu código:</div><div className="font-mono tracking-widest text-white/55">{mySecret}</div><div className="mt-2">{humanResults.length} ataques tuyos</div><div>{machineResults.length} de la máquina</div></div></div>
      {phase === "player-turn" && <><div className="mt-10"><p className="text-sm text-white/45">{finalActor === "human" ? "Este es tu turno final. Si descubrís el código, empatás la partida." : "Elegí 4 glifos distintos para atacar."}</p><GlyphSelector value={guess} onChange={setGuess} discardMode={discardMode} discarded={discarded} onToggleDiscard={() => setDiscardMode((value) => !value)} onDiscard={(digit) => setDiscarded((current) => { const next = new Set(current); if (next.has(digit)) next.delete(digit); else next.add(digit); return next; })} /><button type="button" onClick={() => submitGuess({ preventDefault() {} } as FormEvent)} disabled={loading || guess.length !== 4} className="mt-5 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{loading ? "Atacando..." : "Atacar"}</button>{error && <p className="mt-3 text-sm text-red-400">{error}</p>}</div><History humanResults={humanResults} machineResults={machineResults}/></>}
      {phase === "player-result" && lastResult && <ResultPanel result={lastResult} label="Tu ataque" action="Continuar" onAction={continueAfterPlayerResult}/>}
      {phase === "thinking" && <div className="flex flex-1 flex-col items-center justify-center text-center"><ThinkingGlyphs value={machineReveal}/><div className="mt-7 flex gap-2"><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/></div><p className="mt-5 text-sm text-white/40">Analizando posibilidades...</p></div>}
      {phase === "opponent-result" && lastResult && <ResultPanel result={lastResult} label="Ataque de la máquina" action="Tu turno" onAction={continueAfterOpponentResult}/>}
      {phase === "final-turn" && <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="text-xs uppercase tracking-[0.3em] text-white/35">último turno</div><h2 className="mt-5 text-3xl font-medium">{finalActor === "human" ? "Tenés una oportunidad más." : "La máquina tiene una oportunidad más."}</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/40">{finalActor === "human" ? "Fuiste el primero en descubrir el código. Como empezaste primero, el adversario conserva su turno final para buscar el empate. Ahora es tu turno final." : "La máquina fue la primera en descubrir el código. Como empezó primero, vos conservás el turno final para buscar el empate."}</p><button type="button" onClick={beginFinalTurn} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">{finalActor === "human" ? "Jugar mi turno final" : "Continuar"}</button></div>}
      {(phase === "won" || phase === "lost" || phase === "draw") && <div className={"phase-enter flex flex-1 flex-col items-center justify-center text-center " + (phase === "won" ? "text-emerald-400" : phase === "lost" ? "text-red-400" : "text-white")}><div className="text-xs uppercase tracking-[0.3em] text-current/50">partida terminada</div><h2 className="mt-4 text-4xl font-medium">{phase === "won" ? "Ganaste." : phase === "lost" ? "La máquina ganó." : "Empate."}</h2>{phase === "draw" && <p className="mt-3 max-w-md text-sm leading-6 text-current/60">Ambos descubrieron el código en su turno adicional.</p>}<button type="button" onClick={() => { setPhase("setup"); setError(""); setMySecret(""); setGuess(""); setDiscarded(new Set()); setDiscardMode(false); }} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Nueva partida</button></div>}
    </>}
  </section></div></main>;
}
