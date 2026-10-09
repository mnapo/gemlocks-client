import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gem, Coins } from "lucide-react";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { STORE_SECTIONS, type StoreSectionId } from "@/lib/store/items";
import StoreItems from "./store-items";

export default async function StoreSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!(section in STORE_SECTIONS)) notFound();

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) redirect("/login");

  const isPackages = section === "paquetes";
  const sectionData = isPackages ? null : STORE_SECTIONS[section as StoreSectionId];
  const client = getAdminClient();
  const [{ data: userData }, { data: ownedData }] = await Promise.all([
    client.from("app_users").select("gems,coins").eq("id", user.sub).single(),
    client.from("user_store_items").select("item_id").eq("user_id", user.sub),
  ]);
  const packs = [
    { id: "starter", coins: 100, price: "US$ 0,99", description: "Para una pequeña ayuda" },
    { id: "small", coins: 500, price: "US$ 3,99", description: "Un impulso inicial" },
    { id: "medium", coins: 1000, price: "US$ 6,99", description: "Más monedas, mejor valor" },
    { id: "large", coins: 5000, price: "US$ 24,99", description: "Para avanzar mucho más" },
  ];

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/store" className="flex items-center gap-2 text-sm font-medium tracking-tight"><ArrowLeft size={17} /> Tienda</Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-yellow-300/80"><Coins size={16} /> {(userData?.coins ?? 0).toLocaleString("es-AR")}</span>
            <span className="flex items-center gap-1.5 text-cyan-300/80"><Gem size={16} /> {userData?.gems ?? 0}</span>
          </div>
        </header>
        <section className="flex-1 py-10">
          {isPackages ? (
            <>
              <h1 className="text-xl font-medium">Paquetes de monedas</h1>
              <p className="mt-2 text-sm leading-6 text-white/40">Elegí el impulso que mejor se adapte a tu partida.</p>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {packs.map((pack, index) => (
                  <article key={pack.id} className={"relative flex flex-col border p-5 " + (index === 2 ? "border-yellow-400/30 bg-yellow-400/[0.04]" : "border-white/10 bg-white/[0.02]")}>
                    {index === 2 && <span className="absolute right-3 top-3 text-[10px] uppercase tracking-[0.16em] text-yellow-300/70">Popular</span>}
                    <div className="flex items-center gap-2 text-yellow-300/85"><Coins size={22} strokeWidth={1.7} /><span className="text-2xl font-semibold tabular-nums">{pack.coins.toLocaleString("es-AR")}</span></div>
                    <p className="mt-2 text-xs text-white/40">{pack.description}</p>
                    <div className="mt-5 text-lg font-medium">{pack.price}</div>
                    <button type="button" disabled className="mt-4 w-full border border-white/10 px-4 py-3 text-sm text-white/35 disabled:cursor-not-allowed">Próximamente</button>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-xs leading-5 text-white/25">Los paquetes todavía no están disponibles para la compra. Los precios son orientativos y pueden cambiar.</p>
            </>
          ) : (
            <>
              <h1 className="text-xl font-medium">{sectionData!.title}</h1>
              <p className="mt-2 text-sm leading-6 text-white/40">{sectionData!.subtitle}</p>
              <StoreItems items={sectionData!.items} gems={userData?.gems ?? 0} owned={ownedData?.map((item) => item.item_id) ?? []} />
            </>
          )}
        </section>
      </div>
    </main>
  );
}
