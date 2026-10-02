import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Gem, Coins, Sparkles, Zap, Palette, UserRound, Swords, Package, Circle } from "lucide-react";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

const sections = [
  { title: "Gemas", subtitle: "Criptomoneda GLK", icon: Gem, locked: true },
  {
    title: "Glifos",
    subtitle: "Nuevos símbolos más variados para construir tu código",
    icon: Sparkles,
    locked: false,
    items: [
      { name: "Emojis", price: 10, preview: "😀 😎 🤖 👻" },
      { name: "Zodíaco", price: 20, preview: "♈ ♉ ♊ ♋" },
      { name: "Runas", price: 35, preview: "ᚠ ᚢ ᚦ ᚨ" },
    ],
  },
  { title: "Power-ups", subtitle: "Poderes para ganar ventaja en partidas amateur", icon: Zap, locked: true },
  {
    title: "Temas",
    subtitle: "Modificá la estética de todo el juego",
    icon: Palette,
    locked: false,
    items: [
      { name: "Light", price: 5 },
      { name: "Pink", price: 5 },
      { name: "Ocean", price: 5 },
    ],
  },
  {
    title: "Avatares",
    subtitle: "Un ícono que te represente en tu cuenta",
    icon: UserRound,
    locked: false,
    items: [
      { name: "Pelota", price: 15 },
      { name: "Flores", price: 15 },
      { name: "Guitarra", price: 15 },
      { name: "Paisaje", price: 15 },
      { name: "Robot", price: 15 },
      { name: "Elfo", price: 15 },
      { name: "Elfa", price: 15 },
      { name: "Doctor", price: 15 },
      { name: "Doctora", price: 15 },
      { name: "Mago", price: 15 },
      { name: "Maga", price: 15 },
    ],
  },
  { title: "Modalidades", subtitle: "Creá partidas online con modos de juego diferentes al básico", icon: Swords, locked: true },
  { title: "Packs", subtitle: "Ahorrá monedas adquiriendo ítems en cantidad", icon: Package, locked: true },
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
                <div><div className="text-2xl font-medium">0</div><div className="text-xs text-white/35">Monedas</div></div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Gem className="text-cyan-300/80" size={25} strokeWidth={1.7} />
                <div><div className="text-2xl font-medium">0</div><div className="text-xs text-white/35">Gemas</div></div>
              </div>
            </div>
          </div>

          <button type="button" disabled className="mt-5 flex w-full items-center justify-center gap-2 border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-300/45 disabled:cursor-not-allowed disabled:opacity-60">
            <Coins size={18} strokeWidth={1.8} /> Adquirir monedas
          </button>

          <div className="mt-8 space-y-3">
            {sections.map(({ title, subtitle, icon: Icon, locked, items }) => (
              <section key={title} className="border border-white/10 bg-white/[0.02]">
                <button type="button" disabled={locked} className={"flex w-full items-center gap-4 p-4 text-left " + (locked ? "cursor-not-allowed opacity-45" : "cursor-default")}>
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center border border-white/10 bg-white/[0.03] text-white/60">
                    <Icon size={27} strokeWidth={1.5} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-white/35">{subtitle}</span>
                  </span>
                  {locked ? <ArrowRight className="shrink-0 text-white/20" size={20} strokeWidth={1.7} /> : <span className="text-xs text-white/25">{items?.length ?? 0} ítems</span>}
                </button>

                {!locked && items && (
                  <div className="grid grid-cols-2 gap-2 border-t border-white/10 p-3 sm:grid-cols-3">
                    {items.map((item) => (
                      <button key={item.name} type="button" className="group min-w-0 border border-white/10 bg-white/[0.02] p-3 text-left transition hover:border-white/20">
                        <div className="flex h-14 items-center justify-center overflow-hidden text-xl text-white/65">
                          {("preview" in item && item.preview) ? <span>{item.preview}</span> : <Circle size={28} strokeWidth={1.4} className="text-white/30" />}
                        </div>
                        <div className="mt-2 truncate text-xs font-medium">{item.name}</div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-cyan-300/75">
                          <Gem size={13} strokeWidth={1.7} /> {item.price}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
