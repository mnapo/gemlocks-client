import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Swords, Store, UsersRound } from "lucide-react";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";
import TutorialModal from "@/components/tutorial-modal";
import HomePlayButton from "@/components/home-play-button";

export default async function Home() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const user = token ? await verifySessionToken(token) : null;
  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <span className="text-sm font-medium tracking-tight">gemlocks</span>
          <LogoutButton />
        </header>
        <section className="flex flex-1 flex-col items-center justify-center pb-10 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-white/35">Bienvenido/a</p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight">{user.name || user.email}</h1>
          <div className="mt-4 flex items-center justify-center gap-4" aria-label="Gemlocks"><span className="home-gem" /><span className="home-gem" /><span className="home-gem" /></div>

          <div className="mt-8 grid w-full max-w-xl grid-cols-3 gap-3">
            <button type="button" disabled className="home-action-card">
              <span className="home-action-icon home-action-online"><UsersRound size={40} strokeWidth={1.5} /></span>
              <span className="mt-3 text-sm font-medium">Online</span>
              <span className="mt-1 text-[10px] text-white/30">En desarrollo</span>
            </button>
            <HomePlayButton />
            <Link href="/store" className="home-action-card">
              <span className="home-action-icon home-action-store"><Store size={40} strokeWidth={1.5} /></span>
              <span className="mt-3 text-sm font-medium">Tienda</span>
            </Link>
          </div>

          <TutorialModal className="mt-5" />
          <Link href="/ranking" className="mt-4 text-xs text-white/40 transition hover:text-white/75">Ranking</Link>
        </section>
      </div>
    </main>
  );
}