"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftCircle, Bot, Check, Trash2, User, X } from "lucide-react";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";
import TutorialModal from "@/components/tutorial-modal";
import { DEFAULT_GLYPH_SET_ID, GLYPH_SETS, getGlyphSet, getGlyphSetForCode, type GlyphSetId } from "@/lib/game/glyphs";

type Result = { guess: string; perfect: number; regular: number };
type Phase = "setup" | "code-select" | "difficulty" | "coin-toss" | "coin-result" | "player-turn" | "player-result" | "thinking" | "opponent-result" | "final-turn" | "won" | "lost" | "draw";

const phaseTitle: Record<Exclude<Phase, "setup">, string> = {
  "code-select": "Elegí tu código", "difficulty": "Elegí la dificultad", "coin-toss": "Tirando la moneda", "coin-result": "Comienza la partida", "player-turn": "Tu turno",
  "player-result": "Resultado del ataque", thinking: "La máquina está pensando",
  "opponent-result": "Resultado del ataque", "final-turn": "Turno final", won: "Ganaste",
  lost: "La máquina ganó", draw: "Empate",
};

function Glyphs({ value, glyphSetId = DEFAULT_GLYPH_SET_ID }: { value: string; glyphSetId?: GlyphSetId }) {
  const glyphSet = getGlyphSet(glyphSetId);
  const glyphs = Array.from(value);
  return <div className="flex gap-3">{Array.from({ length: 4 }, (_, index) => {
    const glyph = glyphSet.glyphs.find((item) => item.value === glyphs[index]);
    return <div key={index} className="flex h-14 w-14 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl">
      {glyphs[index] ? glyph?.asset ? <svg className="h-11 w-11" viewBox="0 0 100 100"><use href={glyph.asset} /></svg> : <span className="glyph-fill">{glyphs[index]}</span> : <span className="text-white/15">·</span>}
    </div>;
  })}</div>;
}

function GlyphSetPicker({ value, onChange }: { value: GlyphSetId; onChange: (value: GlyphSetId) => void }) {
  return <div className="mt-7 grid grid-cols-4 gap-2">
    {Object.values(GLYPH_SETS).map((set) => {
      const selected = value === set.id;
      const preview = set.glyphs.slice(0, 4);
      return <button key={set.id} type="button" onClick={() => onChange(set.id)} className={"min-w-0 border px-2 py-4 text-center transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}>
        <div className="flex h-10 items-center justify-center gap-1 overflow-hidden">
          {preview.map((glyph) => glyph.asset ? <svg key={glyph.id} className="h-8 w-8 shrink-0" viewBox="0 0 100 100"><use href={glyph.asset} /></svg> : <span key={glyph.id} className="text-xl">{glyph.value}</span>)}
        </div>
        <span className="mt-3 block truncate text-xs text-white/60">{set.name}</span>
        <span className={"mx-auto mt-2 flex h-4 w-4 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span>
      </button>;
    })}
  </div>;
}

function GlyphSelector({
  value,
  onChange,
  glyphSetId = DEFAULT_GLYPH_SET_ID,
  discardMode = false,
  onToggleDiscard,
  discarded = new Set<string>(),
  onDiscard,
}: {
  value: string;
  onChange: (value: string) => void;
  glyphSetId?: GlyphSetId;
  discardMode?: boolean;
  onToggleDiscard?: () => void;
  onDiscard?: (glyph: string) => void;
  discarded?: Set<string>;
}) {
  const glyphSet = getGlyphSet(glyphSetId);
  const glyphs = glyphSet.glyphs;
  const selectedGlyphs = Array.from(value);

  function addGlyph(glyph: string) {
    if (discardMode) {
      if (discarded.has(glyph)) {
        onDiscard?.(glyph);
        return;
      }
      onChange(selectedGlyphs.filter((item) => item !== glyph).join(""));
      onDiscard?.(glyph);
      return;
    }
    if (discarded.has(glyph) || selectedGlyphs.length >= 4 || selectedGlyphs.includes(glyph)) return;
    onChange(value + glyph);
  }

  function randomize() {
    const available = glyphs.map((item) => item.value).filter((glyph): glyph is string => typeof glyph === "string" && !discarded.has(glyph));
    if (available.length < 4) return;
    onChange(available.sort(() => Math.random() - 0.5).slice(0, 4).join(""));
  }

  const [mobileOptions, setMobileOptions] = useState(false);
  const discardButton = onToggleDiscard && <button type="button" onClick={onToggleDiscard} className={"flex h-10 flex-1 items-center justify-center gap-1.5 border px-3 text-xs transition sm:flex-none sm:px-4 " + (discardMode ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-400" : "border-white/10 text-white/50 hover:border-white/25 hover:text-white")}>{discardMode && <Check size={14} strokeWidth={2} />}{discardMode ? "Listo" : "Descartar"}</button>;
  return <div className="mt-5 min-w-0">
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
        <div className="flex shrink-0 gap-2 sm:gap-3">
          {Array.from({ length: 4 }, (_, index) => <div key={index} className="flex h-12 w-12 shrink-0 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-xl sm:h-14 sm:w-14">{selectedGlyphs[index] ? glyphs.find((glyph) => glyph.value === selectedGlyphs[index])?.asset ? <svg className="h-10 w-10" viewBox="0 0 100 100"><use href={glyphs.find((glyph) => glyph.value === selectedGlyphs[index])?.asset} /></svg> : selectedGlyphs[index] : <span className="text-white/15">·</span>}</div>)}
        </div>
        <button type="button" title="Borrar último glifo" aria-label="Borrar último glifo" onClick={() => onChange(selectedGlyphs.slice(0, -1).join(""))} disabled={!value} className="ml-0 flex h-9 w-9 shrink-0 items-center justify-center text-white/45 transition hover:text-white disabled:opacity-20 sm:ml-1 sm:h-10 sm:w-10"><ArrowLeftCircle size={19} strokeWidth={1.8} /></button>
        <button type="button" title="Borrar selección" aria-label="Borrar selección" onClick={() => onChange("")} className="hidden h-10 w-10 shrink-0 items-center justify-center text-red-500 transition hover:text-red-400 sm:flex"><Trash2 size={17} strokeWidth={2.2} /></button>
        <button type="button" aria-label="Mostrar más opciones" onClick={() => setMobileOptions((open) => !open)} className="flex h-9 w-9 shrink-0 items-center justify-center border border-white/10 text-sm text-white/45 transition hover:border-white/25 hover:text-white sm:hidden">{mobileOptions ? "×" : "..."}</button>
        <button type="button" onClick={randomize} disabled={discarded.size > 6} className="hidden h-10 border border-white/10 px-3 text-xs text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-20 sm:flex">Aleatorio</button>
      </div>
      {onToggleDiscard && <div className="hidden sm:block sm:ml-auto">{discardButton}</div>}
      {mobileOptions && <div className="flex w-full gap-2 overflow-hidden sm:hidden"><button type="button" title="Borrar selección" aria-label="Borrar selección" onClick={() => onChange("")} className="flex h-10 flex-1 items-center justify-center border border-white/10 text-red-500 transition hover:border-white/25 hover:text-red-400"><Trash2 size={17} strokeWidth={2.2} /></button><button type="button" onClick={randomize} disabled={discarded.size > 6} className="flex h-10 flex-1 items-center justify-center border border-white/10 px-3 text-xs text-white/50 transition hover:border-white/25 hover:text-white disabled:opacity-20">Aleatorio</button>{onToggleDiscard && discardButton}</div>}
    </div>
    {discardMode && <div className="mb-2 border border-white/10 px-3 py-2 text-xs text-white/45">Seleccioná qué glifos querés descartar:</div>}
    <div className="mt-5 grid grid-cols-5 gap-2">
      {glyphs.map((glyph) => {
        const glyphValue = glyph.value!;
        const used = selectedGlyphs.includes(glyphValue);
        const isDiscarded = discarded.has(glyphValue);
        return <button key={glyph.id} type="button" disabled={!discardMode && (isDiscarded || used || selectedGlyphs.length >= 4)} onClick={() => addGlyph(glyphValue)} className={"relative h-10 border font-mono text-sm transition " + (isDiscarded ? "border-red-500/25 text-red-500/70" : "border-white/10 bg-white/[0.02] hover:border-white/25") + (discardMode && !isDiscarded ? " border-emerald-500/30 hover:border-emerald-400/60" : "") + ((!discardMode && (isDiscarded || used || selectedGlyphs.length >= 4)) ? " cursor-not-allowed opacity-20" : "")}>
          {glyph.asset ? <svg className={"mx-auto h-8 w-8 " + (isDiscarded ? "opacity-70" : "")} viewBox="0 0 100 100"><use href={glyph.asset} /></svg> : <span className={"relative inline-flex " + (isDiscarded ? "text-red-400" : "")}>{glyphValue}{isDiscarded && <X className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 opacity-40" size={22} strokeWidth={2.5} />}</span>}
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
function ResultPanel({ result, label, action, onAction, glyphSetId }: { result: Result; label: string; action: string; onAction: () => void; glyphSetId: GlyphSetId }) {
  return <div className="flex flex-1 flex-col justify-center"><div className="border border-white/10 bg-white/[0.02] p-7 text-center"><p className="text-xs uppercase tracking-[0.25em] text-white/35">{label}</p><div className="mt-7 flex justify-center"><Glyphs value={result.guess} glyphSetId={glyphSetId} /></div><div className="mt-8 grid grid-cols-2 border-t border-white/10 pt-6"><div><div className="text-3xl font-medium">{result.perfect}</div><div className="mt-1 text-xs text-white/35">perfectos</div></div><div><div className="text-3xl font-medium">{result.regular}</div><div className="mt-1 text-xs text-white/35">regulares</div></div></div></div><button type="button" onClick={onAction} className="mt-6 bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">{action}</button></div>;
}

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);
  const [glyphSetId, setGlyphSetId] = useState<GlyphSetId>(DEFAULT_GLYPH_SET_ID);
  const [phase, setPhase] = useState<Phase>("setup");
  const [guess, setGuess] = useState("");
  const [mySecret, setMySecret] = useState("");
  const [machineReveal, setMachineReveal] = useState("");
  const [machineSecret, setMachineSecret] = useState("");
  const [humanResults, setHumanResults] = useState<Result[]>([]);
  const [machineResults, setMachineResults] = useState<Result[]>([]);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [starter, setStarter] = useState<"human" | "machine">("human");
  const [finalActor, setFinalActor] = useState<"human" | "machine" | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [discarded, setDiscarded] = useState<Set<string>>(new Set());
  const [confirmClose, setConfirmClose] = useState(false);
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/game/current", { cache: "no-store" });
        const data = await res.json().catch(() => null);
        if (!active || !data?.active) return;
        const state = data.state;
        setDifficulty(state.difficulty);
        const restoredGlyphSet = getGlyphSetForCode(state.humanSecret);
        if (restoredGlyphSet) setGlyphSetId(restoredGlyphSet.id);
        setStarter(state.starter);
        setMySecret(state.humanSecret);
        setHumanResults(state.humanGuesses ?? []);
        setMachineResults(state.machineGuesses ?? []);
        if (state.firstWinner && !state.finalTurnUsed) {
          setFinalActor(state.firstWinner === "human" ? "machine" : "human");
          setPhase("final-turn");
        } else if (state.currentPlayer === "human") {
          setPhase("player-turn");
        } else {
          setPhase("thinking");
        }
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (restoring || ["setup", "won", "lost", "draw"].includes(phase)) return;
    window.history.pushState({ gemlocksGame: true }, "", window.location.href);
    const onPopState = () => {
      window.history.pushState({ gemlocksGame: true }, "", window.location.href);
      requestClose();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [phase, restoring]);

  useEffect(() => {
    if (restoring || ["setup", "won", "lost", "draw"].includes(phase)) return;
    const heartbeat = window.setInterval(() => {
      fetch("/api/game/current", { cache: "no-store" }).catch(() => {});
    }, 30000);
    return () => window.clearInterval(heartbeat);
  }, [phase, restoring]);

  async function confirmAbandon() {
    setConfirmClose(false);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/game/abandon", { method: "POST", keepalive: true });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "No se pudo cerrar la partida.");
        return;
      }
      setPhase("lost");
    } catch {
      setError("Error de conexión. La partida no pudo cerrarse.");
    } finally {
      setLoading(false);
    }
  }

  function requestClose() { setConfirmClose(true); }

  async function startGame() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/game/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ difficulty, glyphSet: glyphSetId, humanSecret: mySecret }) });
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
    if (Array.from(guess).length !== 4 || loading) return;
    setLoading(true); setError("");
    try {
      const { res, data } = await attack("human", guess);
      if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
      const result = data.result as Result;
      setHumanResults((current) => [...current, result]); setLastResult(result); setGuess(""); setDiscardMode(false); if (data.machineSecret) setMachineSecret(String(data.machineSecret));
      if (data.status === "final-turn") { setFinalActor(data.finalActor); setPhase("final-turn"); }
      else if (data.status === "won" || data.status === "lost" || data.status === "draw") setPhase(data.status);
      else setPhase("player-result");
    } catch { setError("Error de conexión. Intentá de nuevo."); }
    finally { setLoading(false); }
  }

  useEffect(() => {
    if (phase !== "thinking") return;
    let active = true;
    setMachineReveal(""); setMachineSecret("");
    const timer = window.setTimeout(async () => {
      try {
        const { res, data } = await attack("machine");
        if (!active) return;
        if (!res.ok) { setError(data?.error ?? "No se pudo procesar el ataque"); return; }
        const machineGuess = String(data.machineGuess ?? "");
        for (let index = 0; index < machineGuess.length; index++) {
          await new Promise((resolve) => window.setTimeout(resolve, 550));
          if (!active) return;
          setMachineReveal(Array.from(machineGuess).slice(0, index + 1).join(""));
        }
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        if (!active) return;
        const result = data.result as Result;
        setMachineResults((current) => [...current, result]); setLastResult(result); if (data.machineSecret) setMachineSecret(String(data.machineSecret));
        if (data.status === "final-turn") { setFinalActor(data.finalActor); setPhase("final-turn"); }
        else if (data.status === "won" || data.status === "lost" || data.status === "draw") setPhase(data.status);
        else setPhase("opponent-result");
      } catch { if (active) setError("Error de conexión. Intentá de novo."); }
    }, 1200);
    return () => { active = false; window.clearTimeout(timer); };
  }, [phase]);

  function beginMatch() { setPhase(starter === "human" ? "player-turn" : "thinking"); }
  function continueAfterPlayerResult() { setLastResult(null); setPhase("thinking"); }
  function continueAfterOpponentResult() { setLastResult(null); setPhase("player-turn"); }
  function beginFinalTurn() { setLastResult(null); setPhase(finalActor === "human" ? "player-turn" : "thinking"); }

  if (phase === "setup" || phase === "code-select" || phase === "difficulty") return <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]"><div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"><header className="flex items-center justify-between border-b border-white/10 py-5"><Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link><Link href="/" className="text-xs text-white/40 hover:text-white/75">Volver</Link></header><section key={phase} className="phase-enter flex flex-1 flex-col justify-center py-12"><p className="text-xs uppercase tracking-[0.3em] text-white/35">jugador vs máquina</p>{phase === "setup" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Nueva partida</h1><p className="mt-3 text-sm leading-6 text-white/40">Primero elegí el set de glifos que se usará en la partida.</p><p className="mt-7 text-xs uppercase tracking-[0.25em] text-white/35">Set de glifos</p><GlyphSetPicker value={glyphSetId} onChange={(value) => { setGlyphSetId(value); setMySecret(""); }} /><button type="button" onClick={() => setPhase("difficulty")} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">Continuar</button><TutorialModal variant="outline" triggerLabel="Ver Tutorial" className="mt-3 w-full" /></>}{phase === "code-select" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí tu código</h1><p className="mt-3 text-sm leading-6 text-white/40">El adversario intentará descubrir estos 4 glifos.</p><GlyphSelector value={mySecret} onChange={setMySecret} glyphSetId={glyphSetId}/>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<button type="button" onClick={startGame} disabled={loading || Array.from(mySecret).length !== 4} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{loading ? "Iniciando..." : "Comenzar partida"}</button></>}{phase === "difficulty" && <><h1 className="mt-4 text-3xl font-medium tracking-tight">Elegí la dificultad</h1><p className="mt-3 text-sm leading-6 text-white/40">Una carrera por descubrir el código secreto del adversario.</p><div className="mt-8 grid gap-2">{DIFFICULTIES.map((option) => { const selected = difficulty === option.level; return <button key={option.level} type="button" onClick={() => setDifficulty(option.level)} className={"flex items-center justify-between border px-4 py-4 text-left transition " + (selected ? "border-white/40 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/20")}><span><span className="block text-sm font-medium">{option.level}. {option.name}</span><span className="mt-1 block text-xs leading-5 text-white/40">{option.description}</span></span><span className={"ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border " + (selected ? "border-white/80" : "border-white/25")}>{selected && <span className="h-2 w-2 rounded-full bg-white" />}</span></button>; })}</div>{error && <p className="mt-4 text-sm text-red-400">{error}</p>}<button type="button" onClick={() => setPhase("code-select")} className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b]">Seleccionar</button></>}</section></div></main>;

  const inMatch = !["coin-toss", "coin-result"].includes(phase);
  return <main className="min-h-screen overflow-x-clip bg-[#0b0b0b] px-4 text-[#f5f5f5] sm:px-6"><div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col"><header className="flex items-center justify-between border-b border-white/10 py-5"><button type="button" onClick={requestClose} className="text-sm font-medium tracking-tight">gemlocks</button><div className="flex items-center gap-3 text-xs"><span className="text-white/40">Nivel {difficulty}</span><span className="text-white/20">|</span><button type="button" onClick={requestClose} className="text-red-400/70 transition hover:text-red-400">Abandonar</button></div></header><section key={phase} className="phase-enter flex min-w-0 flex-1 flex-col py-7 sm:py-10">
    {!inMatch && phase === "coin-toss" && <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="text-xs uppercase tracking-[0.3em] text-white/35">sorteo</p><h1 className="mt-4 text-3xl font-medium">¿Quién empieza?</h1><Coin /></div>}
    {!inMatch && phase === "coin-result" && <div className="flex flex-1 flex-col items-center justify-center text-center"><p className="text-xs uppercase tracking-[0.3em] text-white/35">sorteo terminado</p><h1 className="mt-4 text-3xl font-medium">{starter === "human" ? "Empezás vos." : "Empieza la máquina."}</h1><p className="mt-4 text-sm text-white/40">{starter === "human" ? "Tenés el primer ataque." : "La máquina tiene el primer ataque."}</p><button type="button" onClick={beginMatch} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Comenzar</button></div>}
    {inMatch && <><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.25em] text-white/35">{starter === "human" ? "vos empezaste" : "la máquina empezó"}</p><h1 className="mt-3 text-3xl font-medium tracking-tight">{phaseTitle[phase as Exclude<Phase, "setup">]}</h1></div><div className="text-right text-xs text-white/30"><div>Tu código:</div><div className="font-mono tracking-widest text-white/55">{mySecret}</div><div className="mt-2">{humanResults.length} ataques tuyos</div><div>{machineResults.length} de la máquina</div></div></div>
      {phase === "player-turn" && <><div className="mt-10"><p className="text-sm text-white/45">{finalActor === "human" ? "Este es tu turno final. Si descubrís el código, empatás la partida." : "Elegí 4 glifos distintos para atacar."}</p><GlyphSelector value={guess} onChange={setGuess} glyphSetId={glyphSetId} discardMode={discardMode} discarded={discarded} onToggleDiscard={() => setDiscardMode((value) => !value)} onDiscard={(digit) => setDiscarded((current) => { const next = new Set(current); if (next.has(digit)) next.delete(digit); else next.add(digit); return next; })} /><button type="button" onClick={() => submitGuess({ preventDefault() {} } as FormEvent)} disabled={loading || Array.from(guess).length !== 4} className="mt-5 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{loading ? "Atacando..." : "Atacar"}</button>{error && <p className="mt-3 text-sm text-red-400">{error}</p>}</div><History humanResults={humanResults} machineResults={machineResults}/></>}
      {phase === "player-result" && lastResult && <ResultPanel result={lastResult} label="Tu ataque" action="Continuar" onAction={continueAfterPlayerResult} glyphSetId={glyphSetId}/>}
      {phase === "thinking" && <div className="flex flex-1 flex-col items-center justify-center text-center"><ThinkingGlyphs value={machineReveal}/><div className="mt-7 flex gap-2"><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/><span className="thinking-dot h-3 w-3 rounded-full bg-white/80"/></div><p className="mt-5 text-sm text-white/40">Analizando posibilidades...</p></div>}
      {phase === "opponent-result" && lastResult && <ResultPanel result={lastResult} label="Ataque de la máquina" action="Tu turno" onAction={continueAfterOpponentResult} glyphSetId={glyphSetId}/>}
      {phase === "final-turn" && <div className="flex flex-1 flex-col items-center justify-center text-center"><div className="text-xs uppercase tracking-[0.3em] text-white/35">último turno</div><h2 className="mt-5 text-3xl font-medium">{finalActor === "human" ? "Tenés una oportunidad más." : "La máquina tiene una oportunidad más."}</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/40">{starter === "human" ? "Fuiste el primero en descubrir el código. Como empezaste primero, la máquina conserva su turno final para buscar el empate." : "La máquina fue la primera en descubrir el código. Como empezó primero, conservás un turno final para buscar el empate."}</p><button type="button" onClick={beginFinalTurn} className="mt-8 bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">{finalActor === "human" ? "Jugar mi turno final" : "Continuar"}</button></div>}
      {(phase === "won" || phase === "lost" || phase === "draw") && <div className={"phase-enter flex flex-1 flex-col items-center justify-center text-center " + (phase === "won" ? "text-emerald-400" : phase === "lost" ? "text-red-400" : "text-white")}><div className="text-xs uppercase tracking-[0.3em] text-current/50">partida terminada</div><h2 className="mt-4 text-4xl font-medium">{phase === "won" ? "Ganaste." : phase === "lost" ? "La máquina ganó." : "Empate."}</h2><div className="mt-5 flex items-center justify-center gap-2"><span className="text-xs uppercase tracking-[0.2em] text-white/35">Código del adversario</span><div className="flex gap-1.5">{Array.from(machineSecret).map((glyph, index) => <span key={index} className="flex h-10 w-10 items-center justify-center border border-white/15 bg-white/[0.03] font-mono text-lg text-white">{glyph}</span>)}</div></div>{phase === "draw" && <p className="mt-3 max-w-md text-sm leading-6 text-current/60">Ambos descubrieron el código en su turno adicional.</p>}<div className="mt-8 flex w-full max-w-sm flex-col gap-3"><button type="button" onClick={() => { setPhase("setup"); setError(""); setMySecret(""); setGuess(""); setGlyphSetId(DEFAULT_GLYPH_SET_ID); setDiscarded(new Set()); setDiscardMode(false); setGlyphSetId(DEFAULT_GLYPH_SET_ID); }} className="w-full bg-[#f5f5f5] px-8 py-3 text-sm font-medium text-[#0b0b0b]">Nueva partida</button><Link href="/" className="w-full border border-white/15 px-8 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white">Inicio</Link></div></div>}
    </>}
  </section></div>
    {confirmClose && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm"><div className="w-full max-w-md border border-white/10 bg-[#111] p-6 shadow-2xl"><h2 className="text-xl font-medium">¿Está seguro/a de que desea cerrar la partida?</h2><p className="mt-3 text-sm leading-6 text-white/45">Esto contaría como derrota.</p><div className="mt-7 flex gap-3"><button type="button" onClick={() => setConfirmClose(false)} className="flex-1 border border-white/10 px-4 py-3 text-sm text-white/60 hover:border-white/25 hover:text-white">Cancelar</button><button type="button" onClick={confirmAbandon} className="flex-1 bg-red-500 px-4 py-3 text-sm font-medium text-white">Cerrar partida</button></div></div></div>}
  </main>;
}
