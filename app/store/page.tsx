import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Gem, Coins, Sparkles, Zap, Palette, UserRound, Swords, Package } from "lucide-react";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const sections = [
  { title: "Gemas", subtitle: "Criptomoneda GLK", icon: Gem },
  { title: "Glifos", subtitle: "Nuevos símbolos más variados para construir tu código", icon: Sparkles },
  { title: "Power-ups", subtitle: "Poderes para ganar ventaja en partidas amateur", icon: Zap },
  { title: "Temas", subtitle: "Modificá la estética de todo el juego", icon: Palette },
  { title: "Avatares", subtitle: "Un ícono que te represente en tu cuenta", icon: UserRound },
  { title: "Modalidades", subtitle: "Creá partidas online con modos de juego diferentes al básico", icon: Swords },
  { title: "Packs", subtitle: "Ahorrá monedas adquiriendo ítems en cantidad", icon: Package },
];

export default async function StorePage() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="text-sm font-medium tracking-tight">gemlocks</Link>
          <span className="text-xs uppercase tracking-[0.25em] text-white/30">Tienda</span>
        </header>

        <section className="flex-1 py-10">
          <div className="border border-white/10 bg-white/[0.02] p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/30">Tu saldo</p>
            <div className="mt-5 grid grid-cols-2 divide-x divide-white/10">
              <div className="flex items-center justify-center gap-3">
                <Coins className="text-yellow-400/80" size={25} strokeWidth={1.7} />
                <div>
                  <div className="text-2xl font-medium">0</div>
                  <div className="text-xs text-white/35">Monedas</div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Gem className="text-cyan-300/80" size={25} strokeWidth={1.7} />
                <div>
                  <div className="text-2xl font-medium">0</div>
                  <div className="text-xs text-white/35">Gemas</div>
                </div>
              </div>
            </div>
          </div>

          <button type="button" disabled className="mt-5 flex w-full items-center justify-center gap-2 border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300/45 disabled:cursor-not-allowed disabled:opacity-60">
            <Coins size={18} strokeWidth={1.8} />
            Adquirir monedas
          </button>

          <div className="mt-8 space-y-3">
            {sections.map(({ title, subtitle, icon: Icon }) => (
              <button key={title} type="button" disabled className="flex w-full items-center gap-4 border border-white/10 bg-white/[0.02] p-4 text-left opacity-55 disabled:cursor-not-allowed">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-white/60">
                  <Icon size={27} strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-white/35">{subtitle}</span>
                </span>
                <ArrowRight className="shrink-0 text-white/25" size={20} strokeWidth={1.7} />
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
