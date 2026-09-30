"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const slides = [
  { title:"Descubrí el código", text:"Cada jugador tiene un código secreto de 4 glifos únicos. El objetivo es descubrir el código del adversario antes de que descubra el tuyo.", visual:"secret" },
  { title:"Elegí la dificultad", text:"Antes de empezar elegís uno de los cinco niveles. La dificultad determina cómo piensa y elige sus ataques la máquina.", visual:"difficulty" },
  { title:"Se sortea el primer turno", text:"Una moneda decide quién comienza la partida.", visual:"coin" },
  { title:"Atacá", text:"En tu turno armá un código y atacá. Cada ataque se compara con el código secreto del adversario.", visual:"attack" },
  { title:"Resultados de ataque", text:"Los perfectos indican glifos correctos en la posición correcta. Los regulares indican glifos correctos en otra posición.", visual:"results" },
  { title:"Usá el descarte", text:"Si creés que un glifo no forma parte del código, activá Descartar y bloquealo para tener una ayuda visual durante la partida.", visual:"discard" },
  { title:"Ganá la partida", text:"El primero que descubre el código del adversario gana. Si los cuatro glifos son perfectos, el ataque encontró todo el código.", visual:"win" },
] as const;

function Visual({ type }: { type:string }) {
  if(type==="secret") return <div className="tutorial-visual"><div className="flex gap-2">{["2","7","4","9"].map((n,i)=><span key={n} className="tutorial-glyph tutorial-pop" style={{animationDelay:i*90+"ms"}}>{n}</span>)}</div></div>;
  if(type==="difficulty") return <div className="tutorial-visual"><div className="w-48 space-y-2">{[1,2,3,4,5].map((n,i)=><div key={n} className={"h-6 border px-2 text-[9px] leading-[22px] tutorial-difficulty "+(n===3?"tutorial-difficulty-active":"")} style={{animationDelay:i*450+"ms"}}>Dificultad {n}</div>)}</div></div>;
  if(type==="coin") return <div className="tutorial-visual"><div className="tutorial-coin">G</div></div>;
  if(type==="attack") return <div className="tutorial-visual"><div className="flex items-center gap-4"><div className="flex gap-1.5">{["3","8","1","6"].map((n,i)=><span key={n} className="tutorial-small-glyph tutorial-pop" style={{animationDelay:i*90+"ms"}}>{n}</span>)}</div><span className="text-white/30">→</span><span className="border border-white/10 px-3 py-2 text-xs text-white/40">Atacar</span></div></div>;
  if(type==="results") return <div className="tutorial-visual"><div className="space-y-3"><div className="flex gap-1.5">{["3","8","1","6"].map(n=><span key={n} className="tutorial-small-glyph">{n}</span>)}</div><div className="flex gap-2"><span className="border border-emerald-400/50 bg-emerald-400/10 px-2 py-1 text-[10px] text-emerald-400">8 · perfecto</span><span className="border border-amber-400/50 bg-amber-400/10 px-2 py-1 text-[10px] text-amber-400">6 · regular</span></div></div></div>;
  if(type==="discard") return <div className="tutorial-visual"><div className="grid grid-cols-5 gap-1.5">{["0","1","2","3","4","5","6","7","8","9"].map(n=><span key={n} className={"tutorial-small-glyph "+(["2","5","8"].includes(n)?"tutorial-discard":"")}>{n}{["2","5","8"].includes(n)&&<X size={14}/>}</span>)}</div></div>;
  return <div className="tutorial-visual"><div className="flex gap-2">{["2","7","4","9"].map(n=><span key={n} className="tutorial-win-glyph">{n}</span>)}</div></div>;
}

export default function TutorialModal({triggerLabel="¿Cómo se juega?",variant="link",className=""}:{triggerLabel?:string;variant?:"link"|"outline";className?:string}) {
  const [open,setOpen]=useState(false); const [index,setIndex]=useState(0);
  const slide=slides[index];
  useEffect(()=>{ if(!open)return; const id=window.setInterval(()=>{ const nodes=document.querySelectorAll(".tutorial-pop,.tutorial-difficulty,.tutorial-coin,.tutorial-win-glyph"); nodes.forEach(n=>{(n as HTMLElement).style.animation="none"; void (n as HTMLElement).offsetWidth; (n as HTMLElement).style.animation=""; }); },9000); return()=>window.clearInterval(id); },[open,index]);
  return <>
    <button type="button" onClick={()=>{setIndex(0);setOpen(true)}} className={(variant==="outline"?"border border-white/15 px-4 py-2 text-xs text-white/55 transition hover:border-white/30 hover:text-white ":"text-xs text-white/40 transition hover:text-white/75 ")+className}>{triggerLabel}</button>
    {open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-5 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.25em] text-white/30">tutorial</span><button type="button" onClick={()=>setOpen(false)} className="text-white/35 hover:text-white" aria-label="Cerrar">×</button></div>
        <Visual type={slide.visual}/><h2 className="mt-6 text-xl font-medium">{slide.title}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-white/45">{slide.text}</p>
        <div className="mt-5 flex items-center justify-between"><span className="text-xs text-white/35">{index+1}/{slides.length}</span><div className="flex gap-1.5">{slides.map((_,i)=><span key={i} className={"h-1.5 w-1.5 rounded-full "+(i===index?"bg-white":"bg-white/15")}/>)}</div><div className="flex items-center gap-2"><button type="button" onClick={()=>setIndex(v=>Math.max(0,v-1))} disabled={index===0} className="px-3 py-2 text-xs text-white/35 hover:text-white disabled:opacity-20">Atrás</button><button type="button" onClick={()=>index===slides.length-1?setOpen(false):setIndex(v=>v+1)} className="bg-[#f5f5f5] px-4 py-2 text-xs font-medium text-[#0b0b0b]">{index===slides.length-1?"Cerrar":"Siguiente"}</button></div></div>
      </div>
    </div>}
  </>;
}