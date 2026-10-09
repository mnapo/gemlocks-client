"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";


function Visual({ type }: { type:string }) {
  const { t } = useI18n();
  if(type==="secret") return <div className="tutorial-visual"><div className="flex gap-2">{["2","7","4","9"].map((n,i)=><span key={n} className="tutorial-glyph tutorial-pop" style={{animationDelay:i*90+"ms"}}>{n}</span>)}</div></div>;
  if(type==="difficulty") return <div className="tutorial-visual"><div className="w-48 space-y-2">{[1,2,3,4,5].map((n)=><div key={n} className={"h-6 border px-2 text-[9px] leading-[22px] tutorial-difficulty "+([1,3,5].includes(n)?"tutorial-difficulty-cycle":"")}>{t("tutorialDifficulty")} {n}</div>)}</div></div>;
  if(type==="coin") return <div className="tutorial-visual"><div className="tutorial-coin">G</div></div>;
  if(type==="attack") return <div className="tutorial-visual"><div className="flex items-center gap-5"><div className="flex gap-1.5">{["3","8","1","6"].map((n,i)=><span key={n} className="tutorial-small-glyph tutorial-pop" style={{animationDelay:i*90+"ms"}}>{n}</span>)}</div><span className="tutorial-swords">⚔️</span></div></div>;
  if(type==="results") return <div className="tutorial-visual"><div className="tutorial-results">
  <div className="tutorial-code-row"><span className="tutorial-result-label">{t("tutorialSecret")} →</span><div className="tutorial-result-code">{["6","8","4","2"].map((n,i)=><span key={n} className={"tutorial-result-glyph tutorial-secret-glyph-"+i}>{n}</span>)}</div></div>
  <div className="tutorial-code-row"><span className="tutorial-result-label">{t("tutorialAttackLabel")} →</span><div className="tutorial-result-code">{["3","8","1","6"].map((n,i)=><span key={n} className={"tutorial-result-glyph tutorial-attack-glyph-"+i}>{n}</span>)}</div></div>
  <div className="tutorial-result-bottom"><div className="tutorial-result-item perfect-result"><span className="tutorial-result-value">8</span><span>→ {t("perfectOne")}</span></div><div className="tutorial-result-item regular-result"><span className="tutorial-result-value">6</span><span>→ {t("regularOne")}</span></div></div>
</div></div>;
if(type==="discard") return <div className="tutorial-visual"><div className="grid grid-cols-5 gap-1.5">{["0","1","2","3","4","5","6","7","8","9"].map(n=><span key={n} className={"tutorial-small-glyph "+(["2","5","8"].includes(n)?"tutorial-discard tutorial-discard-seq":"")}>{n}{["2","5","8"].includes(n)&&<X size={14}/>}</span>)}</div></div>;
  return <div className="tutorial-visual"><div className="flex gap-2">{["2","7","4","9"].map(n=><span key={n} className="tutorial-win-glyph">{n}</span>)}</div></div>;
}

export default function TutorialModal({triggerLabel,variant="link",className=""}:{triggerLabel?:string;variant?:"link"|"outline";className?:string}) {
  const { t } = useI18n();
  const [open,setOpen]=useState(false); const [index,setIndex]=useState(0);
  const slides = [
    { title:t("tutorialCodeTitle"), text:t("tutorialCodeText"), visual:"secret" },
    { title:t("tutorialDifficultyTitle"), text:t("tutorialDifficultyText"), visual:"difficulty" },
    { title:t("tutorialCoinTitle"), text:t("tutorialCoinText"), visual:"coin" },
    { title:t("tutorialAttackTitle"), text:t("tutorialAttackText"), visual:"attack" },
    { title:t("tutorialResultsTitle"), text:t("tutorialResultsText"), visual:"results" },
    { title:t("tutorialDiscardTitle"), text:t("tutorialDiscardText"), visual:"discard" },
    { title:t("tutorialWinTitle"), text:t("tutorialWinText"), visual:"win" },
  ];
  const slide=slides[index];
  useEffect(()=>{ if(!open)return; return()=>{}; },[open,index]);
  return <>
    <button type="button" onClick={()=>{setIndex(0);setOpen(true)}} className={(variant==="outline"?"border border-white/15 px-4 py-2 text-xs text-white/55 transition hover:border-white/30 hover:text-white ":"text-xs text-white/40 transition hover:text-white/75 ")+className}>{triggerLabel ?? t("tutorial")}</button>
    {open&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b] px-5" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg border border-white/10 bg-[#0b0b0b] p-6 shadow-2xl">
        <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-[0.25em] text-white/30">{t("tutorialLabel")}</span><button type="button" onClick={()=>setOpen(false)} className="text-white/35 hover:text-white" aria-label={t("tutorialClose")}>×</button></div>
        <Visual type={slide.visual}/><h2 className="mt-6 text-xl font-medium">{slide.title}</h2><p className="mt-3 min-h-14 text-sm leading-6 text-white/45">{slide.text}</p>
        <div className="mt-5 flex items-center justify-between"><span className="text-xs text-white/35">{index+1}/{slides.length}</span><div className="flex gap-1.5">{slides.map((_,i)=><span key={i} className={"h-1.5 w-1.5 rounded-full "+(i===index?"bg-white":"bg-white/15")}/>)}</div><div className="flex items-center gap-2"><button type="button" onClick={()=>setIndex(v=>Math.max(0,v-1))} disabled={index===0} className="px-3 py-2 text-xs text-white/35 hover:text-white disabled:opacity-20">{t("tutorialBack")}</button><button type="button" onClick={()=>index===slides.length-1?setOpen(false):setIndex(v=>v+1)} className="bg-[#f5f5f5] px-4 py-2 text-xs font-medium text-[#0b0b0b]">{index===slides.length-1?t("tutorialClose"):t("tutorialNext")}</button></div></div>
      </div>
    </div>}
  </>;
}