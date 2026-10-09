"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Coins, Gem, Package, Palette, Sparkles, Swords, UserRound, Zap } from "lucide-react";
import { STORE_SECTIONS, type StoreSectionId } from "@/lib/store/items";
import StoreItems from "@/app/store/[section]/store-items";

type Props = { coins: number; gems: number; owned: string[] };

const sections = [
  { id: "glifos", title: "Glifos", subtitle: "Nuevos símbolos más variados para construir tu código", icon: Sparkles },
  { id: "power-ups", title: "Power-ups", subtitle: "Poderes para ganar ventaja en partidas amateur", icon: Zap, locked: true },
  { id: "gemlocks", title: "Gemlocks", subtitle: "Adquirí cofres para personalizar tu tesoro", icon: Package },
  { id: "temas", title: "Temas", subtitle: "Modificá la estética de todo el juego", icon: Palette },
  { id: "avatares", title: "Avatares", subtitle: "Un ícono que te represente en tu cuenta", icon: UserRound },
  { id: "modalidades", title: "Modalidades", subtitle: "Creá partidas online con modos de juego diferentes al básico", icon: Swords, locked: true },
  { id: "paquetes", title: "Paquetes", subtitle: "Colecciones temáticas con varios artículos", icon: Package },
] as const;

const coinPacks = [
  { id: "starter", coins: 100, price: "US$ 0,99", description: "Para una pequeña ayuda" },
  { id: "small", coins: 500, price: "US$ 3,99", description: "Un impulso inicial" },
  { id: "medium", coins: 1000, price: "US$ 6,99", description: "Más monedas, mejor valor", popular: true },
  { id: "large", coins: 5000, price: "US$ 24,99", description: "Para avanzar mucho más" },
];

const itemPacks = [
  { id: "elfico", name: "Élfico", subtitle: "La magia del bosque antiguo", contents: ["Set de glifos: Runas", "Avatares: Elfo y Elfa", "Tema: Forest"], accent: "border-emerald-300/25 bg-emerald-300/[0.04]" },
  { id: "pirata", name: "Pirata", subtitle: "Tesoros para quienes surcan los mares", contents: ["Cofre: Pirata", "Avatar: Capitán pirata", "Tema: Aguas oscuras"], accent: "border-amber-300/25 bg-amber-300/[0.04]" },
  { id: "cosmico", name: "Cósmico", subtitle: "Un estilo venido de otra galaxia", contents: ["Set de glifos: Constelaciones", "Avatar: Explorador espacial", "Tema: Nebulosa"], accent: "border-violet-300/25 bg-violet-300/[0.04]" },
  { id: "halloween", name: "Halloween", subtitle: "Edición especial de temporada", contents: ["Set de glifos: Misterio", "Avatares: Bruja y Espectro", "Tema: Noche embrujada"], accent: "border-orange-300/25 bg-orange-300/[0.04]" },
];

export default function StoreBrowser({ coins, gems, owned }: Props) {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [direction, setDirection] = useState<"forward" | "back">("forward");

  const [exitingSection, setExitingSection] = useState<string | null>(null);

  function openSection(id: string) {
    const selected = sections.find((item) => item.id === id);
    if (!selected || ("locked" in selected && selected.locked)) return;
    setDirection("forward");
    setExitingSection(null);
    setActiveSection(id);
  }

  function goBack() {
    if (!activeSection) return;
    setDirection("back");
    setExitingSection(activeSection);
    setActiveSection(null);
    window.setTimeout(() => setExitingSection(null), 340);
  }

  const displayedSection = activeSection ?? exitingSection;
  const section = displayedSection && !["paquetes", "coins"].includes(displayedSection) ? STORE_SECTIONS[displayedSection as StoreSectionId] : null;

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="flex items-center gap-2 text-sm font-medium tracking-tight transition hover:text-white/70"><ArrowLeft size={16} /> Inicio</Link>
          <span className="text-xs uppercase tracking-[0.25em] text-white/30">Tienda</span>
        </header>

        <div className="relative grid flex-1 grid-cols-1 overflow-hidden">
          <section aria-hidden={activeSection !== null} className={"store-view col-start-1 row-start-1 py-10 " + (activeSection ? "store-home-out" : direction === "back" ? "store-home-in" : "")}>
            <div className="border border-white/10 bg-white/[0.02] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-white/30">Tu saldo</p>
              <div className="mt-5 grid grid-cols-2 divide-x divide-white/10">
                <div className="flex items-center justify-center gap-3"><Coins className="text-yellow-400/80" size={25} strokeWidth={1.7} /><div><div className="text-2xl font-medium">{coins.toLocaleString("es-AR")}</div><div className="text-xs text-white/35">Monedas</div></div></div>
                <div className="flex items-center justify-center gap-3"><Gem className="text-cyan-300/80" size={25} strokeWidth={1.7} /><div><div className="text-2xl font-medium">{gems.toLocaleString("es-AR")}</div><div className="text-xs text-white/35">Gemas</div></div></div>
              </div>
            </div>

            <button type="button" onClick={() => openSection("coins")} className="mt-5 flex w-full items-center justify-center gap-2 border border-yellow-500/30 bg-yellow-500/[0.06] px-4 py-3 text-sm font-medium text-yellow-300/80 transition hover:border-yellow-400/50 hover:bg-yellow-500/10"><Coins size={18} strokeWidth={1.8} /> Adquirir monedas <ArrowRight size={16} /></button>

            <div className="mt-8 space-y-3">
              {sections.map(({ id, title, subtitle, icon: Icon, ...rest }) => {
                const locked = "locked" in rest && rest.locked;
                return locked ? (
                  <div key={id} className="flex w-full items-center gap-4 border border-white/10 bg-white/[0.02] p-4 text-left opacity-40">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-white/60"><Icon size={27} strokeWidth={1.5} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-white/35">{subtitle}</span></span><ArrowRight className="shrink-0 text-white/20" size={20} strokeWidth={1.7} />
                  </div>
                ) : (
                  <button key={id} type="button" onClick={() => openSection(id)} className="flex w-full items-center gap-4 border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-white/20">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-white/60"><Icon size={27} strokeWidth={1.5} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-sm font-medium">{title}</span><span className="mt-1 block text-xs leading-5 text-white/35">{subtitle}</span></span><ArrowRight className="shrink-0 text-white/20" size={20} strokeWidth={1.7} />
                  </button>
                );
              })}
            </div>
          </section>

          {displayedSection !== null && <section key={displayedSection} className={"store-view col-start-1 row-start-1 py-10 " + (direction === "back" && exitingSection ? "store-detail-out" : "store-detail-in")}>
            <button type="button" onClick={goBack} className="mb-7 inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-sm text-white/65 transition hover:border-white/25 hover:text-white"><ArrowLeft size={16} /> Regresar</button>
            {displayedSection === "paquetes" ? (
              <>
                <h1 className="text-xl font-medium">Paquetes especiales</h1>
                <p className="mt-2 text-sm leading-6 text-white/40">Colecciones temáticas que reúnen varios artículos en una sola compra.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {itemPacks.map((pack) => <article key={pack.id} className={"flex flex-col border p-5 " + pack.accent}>
                    <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-medium">{pack.name}</h2><p className="mt-1 text-xs text-white/45">{pack.subtitle}</p></div><Package size={22} className="shrink-0 text-white/50" strokeWidth={1.5} /></div>
                    <ul className="mt-5 flex-1 space-y-2">{pack.contents.map((item) => <li key={item} className="flex items-start gap-2 text-sm text-white/65"><span className="mt-1 text-white/30">•</span><span>{item}</span></li>)}</ul>
                    <button type="button" disabled className="mt-5 w-full border border-white/10 px-4 py-3 text-sm text-white/35 disabled:cursor-not-allowed">Próximamente</button>
                  </article>)}
                </div>
                <p className="mt-5 text-xs leading-5 text-white/25">Los contenidos son propuestas iniciales; precios y disponibilidad se definirán más adelante.</p>
              </>
            ) : displayedSection === "coins" ? (
              <>
                <h1 className="text-xl font-medium">Paquetes de monedas</h1>
                <p className="mt-2 text-sm leading-6 text-white/40">Elegí el impulso que mejor se adapte a tu partida.</p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {coinPacks.map((pack) => <article key={pack.id} className={"relative flex flex-col border p-5 " + (pack.popular ? "border-yellow-400/30 bg-yellow-400/[0.04]" : "border-white/10 bg-white/[0.02]")}>
                    {pack.popular && <span className="absolute right-3 top-3 text-[10px] uppercase tracking-[0.16em] text-yellow-300/70">Popular</span>}
                    <div className="flex items-center gap-2 text-yellow-300/85"><Coins size={22} strokeWidth={1.7} /><span className="text-2xl font-semibold tabular-nums">{pack.coins.toLocaleString("es-AR")}</span></div>
                    <p className="mt-2 text-xs text-white/40">{pack.description}</p><div className="mt-5 text-lg font-medium">{pack.price}</div>
                    <button type="button" disabled className="mt-4 w-full border border-white/10 px-4 py-3 text-sm text-white/35 disabled:cursor-not-allowed">Próximamente</button>
                  </article>)}
                </div>
                <p className="mt-5 text-xs leading-5 text-white/25">Los paquetes de monedas todavía no están disponibles para la compra. Los precios son orientativos y pueden cambiar.</p>
              </>            ) : section ? (
              <>
                <h1 className="text-xl font-medium">{section.title}</h1><p className="mt-2 text-sm leading-6 text-white/40">{section.subtitle}</p>
                <StoreItems items={section.items} gems={gems} owned={owned} />
              </>
            ) : <p className="text-sm text-white/45">Esta sección todavía no está disponible.</p>}
          </section>}
        </div>
      </div>
    </main>
  );
}
