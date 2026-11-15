"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { ArrowUp, Heart, MessageCircle, Newspaper, Trophy } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import { TutorialVisual } from "@/components/tutorial-modal";
import type { TranslationKey } from "@/lib/i18n/translations";

type User = { name: string; email: string };
type NewsItem = { id: string; title: string; body: string; published_at: string };
type Player = { rank_position: number; name: string; active_avatar: string | null; score: number };

const heroSlides: { title: TranslationKey; visual: string }[] = [
  { title: "tutorialCodeTitle", visual: "secret" },
  { title: "tutorialDifficultyTitle", visual: "difficulty" },
  { title: "tutorialCoinTitle", visual: "coin" },
  { title: "tutorialAttackTitle", visual: "attack" },
  { title: "tutorialResultsTitle", visual: "results" },
  { title: "tutorialDiscardTitle", visual: "discard" },
  { title: "tutorialWinTitle", visual: "win" },
];

const landingSections = [
  { id: "novedades", label: "Novedades", Icon: Newspaper },
  { id: "ranking", label: "Ranking", Icon: Trophy },
  { id: "contacto", label: "Contacto", Icon: MessageCircle },
  { id: "donaciones", label: "Donaciones", Icon: Heart },
];

export default function LandingPage({ user, logout }: { user: User | null; logout: ReactNode }) {
  const { t } = useI18n();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [kind, setKind] = useState("sugerencia");
  const [message, setMessage] = useState("");
  const [contactStatus, setContactStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [heroSlide, setHeroSlide] = useState(0);
  const [activeSection, setActiveSection] = useState("novedades");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    fetch("/api/news").then(r => r.ok ? r.json() : Promise.reject()).then(d => setNews(d.news ?? [])).catch(() => {});
    fetch("/api/ranking?page=1").then(r => r.ok ? r.json() : Promise.reject()).then(d => setPlayers((d.players ?? []).slice(0, 5))).catch(() => {});
    const updateParallax = () => {
      const hero = document.querySelector<HTMLElement>(".landing-hero");
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--hero-parallax", `${Math.max(-80, Math.min(80, -rect.top * 0.16))}px`);
      setShowBackToTop(window.scrollY > 280);
    };
    updateParallax();
    window.addEventListener("scroll", updateParallax, { passive: true });
    return () => window.removeEventListener("scroll", updateParallax);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setHeroSlide(current => (current + 1) % heroSlides.length), 6200);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const sections = landingSections.map(section => document.getElementById(section.id)).filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.15, 0.35, 0.6] });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
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
    <header className="landing-header sticky top-0 z-20 border-b border-white/10 bg-[#0b0b0b]/95 px-4 backdrop-blur">
      <nav className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3">
        <Link href="#inicio" aria-label="Gemlocks, inicio" className="landing-brand shrink-0" title="Gemlocks"><svg viewBox="0 0 48 48" role="img" aria-label="Cofre Gemlocks"><path d="M8 17.5 24 9l16 8.5v20H8z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M8 17.5h32M13 17.5v20m22-20v20M18 9v-3h12v3M24 17.5v20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/><path d="M20.5 25h7v7h-7z" fill="none" stroke="currentColor" strokeWidth="1.6"/><path d="m24 25 2 3.5-2 3.5-2-3.5z" fill="currentColor"/></svg></Link>
        <div className="landing-section-nav flex items-center gap-2" aria-label="Secciones de la landing">
          {landingSections.map(({ id, label, Icon }) => <a key={id} href={`#${id}`} aria-label={label} title={label} aria-current={activeSection === id ? "location" : undefined} className="landing-section-nav__link"><Icon aria-hidden="true" size={17} strokeWidth={1.55} /></a>)}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-xs sm:gap-3">
          {user ? <><Link href="/game" className="hidden max-w-32 truncate text-white/70 hover:text-white sm:block">{user.name || user.email}</Link><Link href="/game" className="bg-white px-3 py-2 font-medium text-black">Lobby</Link>{logout}</> : <><Link href="/login" className="text-white/65 hover:text-white">Ingresar</Link><Link href="/signup" className="bg-white px-3 py-2 font-medium text-black">Crear cuenta</Link></>}
        </div>
      </nav>
    </header>

    <section id="inicio" className="landing-hero relative isolate flex min-h-[100vh] items-center overflow-hidden px-6 py-24">
      <div className="landing-hero__carousel" aria-hidden="true">
        {heroSlides.map((slide, index) => <div key={slide.visual} className={`landing-hero__slide ${heroSlide === index ? "is-active" : ""}`}>
          <div className="landing-hero__slide-visual"><TutorialVisual type={slide.visual} /></div>
          <p className="landing-hero__slide-title">{t(slide.title)}</p>
        </div>)}
      </div>
      <div className="landing-hero__backdrop" aria-hidden="true" />
      <div className="landing-hero__grid" aria-hidden="true" />
      <div className="landing-hero__content relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <h1 className="landing-hero__title">RAISE YOUR MIND.</h1>
        <p className="landing-hero__eyebrow"><span className="landing-hero__status" /> UN JUEGO DE DEDUCCIÓN</p>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Descubrí el código secreto, anticipá cada movimiento y poné a prueba tu lógica.</p>
        <Link href={user ? "/game" : "/login"} className="landing-hero__cta mt-7 inline-flex items-center gap-10 px-7 py-4 text-sm font-semibold">JUGAR <span aria-hidden>↗</span></Link>
        {!user && <p className="mt-4 text-xs text-white/70">Necesitás una cuenta para jugar. <Link href="/signup" className="text-cyan-200 underline underline-offset-4">Registrate gratis</Link></p>}
        <div className="landing-hero__gems mt-8 flex items-center gap-4" aria-hidden="true"><span className="home-gem"/><span className="home-gem"/><span className="home-gem"/></div>
      </div>
      <span className="landing-hero__index" aria-hidden="true">01 / 04</span>
      <a href="#novedades" className="landing-hero__scroll-arrows" aria-label="Desplazarse a Novedades">
        {[0, 1, 2].map(index => <svg key={index} viewBox="0 0 24 15" aria-hidden="true"><path d="m3 3 9 9 9-9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>)}
      </a>
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
