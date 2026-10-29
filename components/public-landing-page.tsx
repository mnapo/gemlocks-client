"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";

type User = { name: string; email: string };
type NewsItem = { id: string; title: string; body: string; published_at: string };
type Player = { rank_position: number; name: string; active_avatar: string | null; score: number };

export default function LandingPage({ user, logout }: { user: User | null; logout: ReactNode }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [kind, setKind] = useState("sugerencia");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/news").then(r => r.ok ? r.json() : Promise.reject()).then(d => setNews(d.news ?? [])).catch(() => {});
    fetch("/api/ranking?page=1").then(r => r.ok ? r.json() : Promise.reject()).then(d => setPlayers((d.players ?? []).slice(0, 5))).catch(() => {});
  }, []);

  async function submitContact(e: FormEvent) {
    e.preventDefault();
    if (!user) { window.location.href = "/login"; return; }
    setSending(true); setContactStatus("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, message }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "No se pudo enviar el mensaje.");
      setMessage(""); setContactStatus("Mensaje enviado. Gracias por escribirnos.");
    } catch (error) { setContactStatus(error instanceof Error ? error.message : "Error de conexión."); }
    finally { setSending(false); }
  }

  return <main className="min-h-screen bg-[#0b0b0b] text-[#f5f5f5]">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0b]/95 px-5 backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">gemlocks</Link>
        <div className="hidden items-center gap-5 text-xs text-white/55 md:flex">
          <a href="#novedades" className="hover:text-white">Novedades</a><a href="#ranking" className="hover:text-white">Ranking</a><a href="#contacto" className="hover:text-white">Contacto</a><a href="#donaciones" className="hover:text-white">Donaciones</a>
        </div>
        <div className="flex items-center gap-3 text-xs">
          {user ? <><Link href="/game" className="max-w-32 truncate text-white/70 hover:text-white">{user.name || user.email}</Link><Link href="/game" className="bg-white px-3 py-2 font-medium text-black">Lobby</Link>{logout}</> : <><Link href="/login" className="text-white/65 hover:text-white">Ingresar</Link><Link href="/signup" className="bg-white px-3 py-2 font-medium text-black">Crear cuenta</Link></>}
        </div>
      </nav>
    </header>

    <section className="mx-auto flex min-h-[75vh] max-w-6xl flex-col items-start justify-center px-6 py-24">
      <p className="text-xs uppercase tracking-[0.35em] text-white/35">Un juego de deducción</p>
      <h1 className="mt-5 max-w-3xl text-5xl font-medium leading-[1.08] tracking-tight sm:text-7xl">Raise your mind.</h1>
      <p className="mt-6 max-w-xl text-base leading-7 text-white/50">Descubrí el código secreto, anticipá cada movimiento y poné a prueba tu lógica.</p>
      <Link href={user ? "/game" : "/login"} className="mt-9 inline-flex items-center bg-white px-6 py-3.5 text-sm font-medium text-black transition hover:bg-white/90">Jugar <span className="ml-8" aria-hidden>↗</span></Link>
      {!user && <p className="mt-4 text-xs text-white/35">Necesitás una cuenta para jugar. <Link href="/signup" className="text-white/65 underline underline-offset-4">Registrate gratis</Link></p>}
      <div className="mt-16 flex gap-3" aria-hidden><span className="home-gem"/><span className="home-gem"/><span className="home-gem"/></div>
    </section>

    <section id="novedades" className="scroll-mt-20 border-t border-white/10 px-6 py-20"><div className="mx-auto max-w-6xl"><p className="text-xs uppercase tracking-[0.25em] text-white/35">Actualizaciones</p><h2 className="mt-3 text-3xl font-medium">Novedades</h2>
      {news.length ? <div className="mt-8 grid gap-4 md:grid-cols-3">{news.map(item => <article key={item.id} className="border border-white/10 p-5"><p className="text-xs text-white/35">{new Date(item.published_at).toLocaleDateString("es-AR")}</p><h3 className="mt-3 font-medium">{item.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/50">{item.body}</p></article>)}</div> : <p className="mt-5 text-sm text-white/35">Próximamente, novedades del juego.</p>}
    </div></section>

    <section id="ranking" className="scroll-mt-20 border-t border-white/10 px-6 py-20"><div className="mx-auto max-w-6xl"><div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-white/35">Competencia</p><h2 className="mt-3 text-3xl font-medium">Ranking</h2></div><Link href="/ranking" className="text-xs text-white/50 hover:text-white">Ver ranking completo ↗</Link></div>
      <div className="mt-8 divide-y divide-white/10 border-y border-white/10">{players.map(p => <div key={p.rank_position} className="flex items-center gap-4 py-4"><span className="w-8 text-sm text-white/35">{p.rank_position}</span><img src={p.active_avatar ? `/store/avatars/${p.active_avatar.replace("avatar-", "")}.svg` : "/store/avatars/predeterminado.svg"} alt="" className="h-9 w-9 rounded-full object-contain"/><span className="flex-1 text-sm">{p.name || "Sin nombre"}</span><span className="text-sm tabular-nums text-white/55">{p.score} pts</span></div>)}
      {!players.length && <p className="py-8 text-sm text-white/35">El ranking aparecerá aquí cuando haya resultados.</p>}</div>
    </div></section>

    <section id="contacto" className="scroll-mt-20 border-t border-white/10 px-6 py-20"><div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2"><div><p className="text-xs uppercase tracking-[0.25em] text-white/35">Estamos para ayudarte</p><h2 className="mt-3 text-3xl font-medium">Contacto</h2><p className="mt-4 max-w-md text-sm leading-6 text-white/45">Reportá un problema, compartí una sugerencia o pedí asistencia. Se admite un mensaje por usuario por día (hora de Argentina).</p></div>
      <form onSubmit={submitContact} className="space-y-3"><label className="block text-xs text-white/45">Tipo de mensaje<select value={kind} onChange={e=>setKind(e.target.value)} className="mt-2 w-full border border-white/10 bg-[#111] px-3 py-3 text-sm text-white"><option value="reporte">Reporte</option><option value="sugerencia">Sugerencia</option><option value="asistencia">Asistencia</option><option value="solicitud">Solicitud</option></select></label><label className="block text-xs text-white/45">Mensaje<textarea value={message} onChange={e=>setMessage(e.target.value)} required minLength={5} maxLength={2000} rows={5} className="mt-2 w-full resize-y border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white outline-none focus:border-white/30" placeholder="¿En qué podemos ayudarte?"/></label><button disabled={sending} className="bg-white px-5 py-3 text-sm font-medium text-black disabled:opacity-50">{sending ? "Enviando…" : user ? "Enviar mensaje" : "Ingresá para contactarnos"}</button>{contactStatus && <p role="status" className="text-sm text-white/65">{contactStatus}</p>}</form>
    </div></section>

    <section id="donaciones" className="scroll-mt-20 border-t border-white/10 px-6 py-16"><div className="mx-auto flex max-w-6xl flex-col justify-between gap-5 sm:flex-row sm:items-center"><div><p className="text-xs uppercase tracking-[0.25em] text-white/35">Apoyá el proyecto</p><h2 className="mt-3 text-2xl font-medium">Donaciones</h2><p className="mt-2 text-sm text-white/45">Tu apoyo ayuda a que Gemlocks siga creciendo.</p></div><a href="https://cafecito.app/" target="_blank" rel="noreferrer" className="w-fit border border-white/20 px-5 py-3 text-sm hover:border-white/50">Invitame un Cafecito ↗</a></div></section>
    <footer className="border-t border-white/10 px-6 py-7"><div className="mx-auto flex max-w-6xl flex-col gap-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Gemlocks · <a className="hover:text-white/70" href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a></span><div className="flex gap-5"><Link href="/privacy" className="hover:text-white/70">Privacidad</Link><Link href="/terms" className="hover:text-white/70">Términos y condiciones</Link></div></div></footer>
  </main>;
}
