import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Gem } from "lucide-react";
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

  const sectionData = STORE_SECTIONS[section as StoreSectionId];
  const client = getAdminClient();
  const [{ data: userData }, { data: ownedData }] = await Promise.all([
    client.from("app_users").select("gems").eq("id", user.sub).single(),
    client.from("user_store_items").select("item_id").eq("user_id", user.sub),
  ]);

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/store" className="flex items-center gap-2 text-sm font-medium tracking-tight"><ArrowLeft size={17} /> Tienda</Link>
          <div className="flex items-center gap-2 text-sm text-cyan-300/80"><Gem size={17} /> {userData?.gems ?? 0}</div>
        </header>
        <section className="flex-1 py-10">
          <h1 className="text-xl font-medium">{sectionData.title}</h1>
          <p className="mt-2 text-sm leading-6 text-white/40">{sectionData.subtitle}</p>
          <StoreItems items={sectionData.items} gems={userData?.gems ?? 0} owned={ownedData?.map((item) => item.item_id) ?? []} />
        </section>
      </div>
    </main>
  );
}
