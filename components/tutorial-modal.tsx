"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

const slides = [
  { title: "Descubrí el código", text: "Cada jugador tiene un código secreto de 4 glifos únicos. El objetivo es descubrir el código del adversario antes de que descubra el tuyo.", visual: "secret" },
  { title: "Elegí la dificultad", text: "Antes de empezar elegís uno de los cinco niveles. La dificultad determina cómo piensa y elige sus ataques la máquina.", visual: "difficulty" },
  { title: "Atacá", text: "En tu turno armá un código y atacá. El historial te muestra cuántos glifos están en la posición correcta y cuántos pertenecen al código.", visual: "attack" },
  { title: "Usá el descarte", text: "Si creés que un glifo no forma parte del código, activá Descartar y bloquealo para tener una ayuda visual durante la partida.", visual: "discard" },
  { title: "Ganá la partida", text: "El primero que descubre el código del adversario gana. Según quién haya empezado, puede existir un turno adicional para empatar.", visual: "win" },
] as const;

function Visual({ type }: { type: (typeof slides)[number]["visual"] }) {
  if (type === "secret") return <div className="tutorial-visual"><div className="flex gap-2">{["2","7","4","9"].map((n, i) => <span key={n} className="tutorial-glyph tutorial-pop" style={{ animationDelay: i * 90 + "ms" }}>{n}</span>)}</div></div>;
  if (type === "difficulty") return <div className="tutorial-visual"><div className="w-44 space-y-2">{[1,2,3,4,5].map((n) => <div key={n} className={"h-5 border px-2 text-[9px] leading-[18px] " + (n === 3 ? "border-white/50 bg-white/10 text-white" : "border-white/10 text-white/20")}>Dificultad {n}</div>)}</div></div>;
  if (type === "attack") return <div className="tutorial-visual"><div className="flex items-center gap-3"><div className="flex gap-1.5">{["3","8","1","6"].map((n, i) => <span key={n} className="tutorial-small-glyph tutorial-pop" style={{ animationDelay: i * 90 + "ms" }}>{n}</span>)}</div><span className="text-white/30">→</span><div className="text-xs text-white/50"><b className="text-white">1</b> perfecto<br/><b className="text-white">2</b> regulares</div></div></div>;
  if (type === "discard") return <div className="tutorial-visual"><div className="grid grid-cols-5 gap-1.5">{["0","1","2","3","4","5","6","7","8","9"].map((n) => <span key={n} className={"tutorial-small-glyph " + (["2","5","8"].includes(n) ? "tutorial-discard" : "")}>{n}{["2","5","8"].includes(n) && <X size={14} />}</span>)}</div></div>;
  return <div className="tutorial-visual"><div className="tutorial-win">✓</div></div>;
}

export default function TutorialModal({ triggerLabel = "¿Cómo se juega?", variant = "link", className = "" }: { triggerLabel?: string; variant?: "link" | "outline"; className?: string }) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return <>
    <button type="button" onClick={() => { setIndex(0); setOpen(true); }} className={variant === "outline" ? "border border-white/15 px-4 py-2 text-xs text-white/55 transition hover:border-white/30 hover:text-white " + className : "text-xs text-white/40 transition hover:text-white/75 " + className}>{triggerLabel}</button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className="w-full max-w-lg border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.25em] text-white/30">tutorial</span>
          <button type="button" onClick={() => setOpen(false)} className="text-white/35 hover:text-white" aria-label="Cerrar">×</button>
        </div>
        <Visual type={slide.visual} />
        <h2 className="mt-6 text-xl font-medium">{slide.title}</h2>
        <p className="mt-3 min-h-14 text-sm leading-6 text-white/45">{slide.text}</p>
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-white/35">{index + 1}/{slides.length}</span>
          <div className="flex items-center gap-1.5">{slides.map((_, i) => <span key={i} className={"h-1.5 w-1.5 rounded-full " + (i === index ? "bg-white" : "bg-white/15")} />)}</div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIndex((v) => Math.max(0, v - 1))} disabled={index === 0} className="px-3 py-2 text-xs text-white/35 hover:text-white disabled:opacity-20">Atrás</button>
            <button type="button" onClick={() => index === slides.length - 1 ? setOpen(false) : setIndex((v) => v + 1)} className="bg-[#f5f5f5] px-4 py-2 text-xs font-medium text-[#0b0b0b]">{index === slides.length - 1 ? "Cerrar" : "Siguiente"}</button>
          </div>
        </div>
      </div>
    </div>}
  </>;
}