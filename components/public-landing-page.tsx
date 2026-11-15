"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useState } from "react";
import { Heart, MessageCircle, Newspaper, Trophy, Gamepad2, UserPlus } from "lucide-react";
import { useI18n } from "@/components/i18n-provider";
import type { TranslationKey } from "@/lib/i18n/translations";

type User = { name: string; email: string };
type NewsItem = { id: string; title: string; body: string; published_at: string };
type Player = { rank_position: number; name: string; active_avatar: string | null; score: number };

const heroSteps = ["difficulty", "coin", "attack"] as const;

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
    const interval = window.setInterval(() => setHeroSlide(current => (current + 1) % heroSteps.length), 6200);
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

  return <main className="landing-page min-h-screen bg-[#0b0b0b] text-[#f5f5f5]">
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
      <div className="landing-hero__art" aria-hidden="true">
        <svg className="landing-hero__mascot" viewBox="0 0 640 470" role="img">
          <defs>
            <linearGradient id="hood-cloth" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#263b61"/><stop offset=".55" stopColor="#101b35"/><stop offset="1" stopColor="#080e20"/></linearGradient>
            <linearGradient id="wood-chest" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bd8750"/><stop offset="1" stopColor="#63391f"/></linearGradient>
            <filter id="mascot-glow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="12"/></filter>
          </defs>
          <ellipse cx="320" cy="425" rx="190" ry="22" fill="#00e5ff" opacity=".13" filter="url(#mascot-glow)"/>
          <path d="M150 405c10-115 42-205 114-252 19-13 37-20 56-20s37 7 56 20c72 47 104 137 114 252l-82 20H232z" fill="url(#hood-cloth)" stroke="#4c7198" strokeWidth="3"/>
          <path d="M218 190c-6-83 36-145 102-153 66 8 108 70 102 153-27-31-61-48-102-48s-75 17-102 48z" fill="url(#hood-cloth)" stroke="#6384a7" strokeWidth="3"/>
          <path d="M250 181c9-45 34-72 70-75 36 3 61 30 70 75-19-13-42-20-70-20s-51 7-70 20z" fill="#030814"/>
          <path d="M246 278c-50 13-82 45-98 95l68 28c29-42 54-63 91-71M394 278c50 13 82 45 98 95l-68 28c-29-42-54-63-91-71" fill="none" stroke="#182a49" strokeWidth="43" strokeLinecap="round"/>
          <path d="M219 363c-22-18-40-20-52-8-13 13-4 34 15 44l38 20c17 9 34-2 31-19-2-13-16-26-32-37zM421 363c22-18 40-20 52-8 13 13 4 34-15 44l-38 20c-17 9-34-2-31-19 2-13 16-26 32-37z" fill="#d6a17d" stroke="#f0c2a0" strokeWidth="3"/>
          <path d="M238 327h164l-12 91H250z" fill="url(#wood-chest)" stroke="#e0ae73" strokeWidth="4"/>
          <path d="M230 327c0-31 24-55 54-55h72c30 0 54 24 54 55z" fill="#9b653a" stroke="#e0ae73" strokeWidth="4"/>
          <path d="M246 344h148M252 389h136" stroke="#4b2b1b" strokeWidth="5" opacity=".65"/>
          <path d="M310 348h20v30h-20z" fill="#e6bd6b" stroke="#fff0b7" strokeWidth="2"/>
          <path d="M320 353l6 10-6 10-6-10z" fill="#5b3b25"/>
          <path d="M214 425h212" stroke="#00e5ff" strokeWidth="2" opacity=".35"/>
        </svg>
      </div>
      <div className="landing-hero__backdrop" aria-hidden="true" />
      <div className="landing-hero__grid" aria-hidden="true" />
      <div className="landing-hero__content relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <div className="landing-hero__tutorial" aria-label="Tutorial visual de tres pasos">
          <div className="landing-hero__step-window">
            <div className={`landing-hero__step ${heroSlide === 0 ? "is-active" : ""}`} aria-hidden={heroSlide !== 0}>
              <div className="landing-hero__difficulty-art"><span/><span/><span/><span/><span/></div>
            </div>
            <div className={`landing-hero__step ${heroSlide === 1 ? "is-active" : ""}`} aria-hidden={heroSlide !== 1}>
              <div className="landing-hero__coin-art">G</div>
            </div>
            <div className={`landing-hero__step ${heroSlide === 2 ? "is-active" : ""}`} aria-hidden={heroSlide !== 2}>
              <div className="landing-hero__attack-art"><span>3</span><span>8</span><span>1</span><span>6</span><i>⚔</i></div>
            </div>
          </div>
          <div className="landing-hero__gems" aria-label={`Paso ${heroSlide + 1} de 3`}>
            {heroSteps.map((step, index) => <button key={step} type="button" className={`landing-hero__gem ${heroSlide === index ? "is-active" : ""}`} aria-label={`Mostrar paso ${index + 1}`} aria-current={heroSlide === index ? "step" : undefined} onClick={() => setHeroSlide(index)}><span className="home-gem"/></button>)}
          </div>
        </div>
        <div className="landing-hero__actions flex items-center justify-center gap-5">
          <Link href={user ? "/game" : "/login"} aria-label={user ? "Abrir lobby" : "Jugar"} title={user ? "Lobby" : "Jugar"} className="landing-hero__icon-action landing-hero__cta"><Gamepad2 aria-hidden="true" size={28} strokeWidth={1.6}/></Link>
          {!user && <Link href="/signup" aria-label="Crear cuenta" title="Crear cuenta" className="landing-hero__icon-action"><UserPlus aria-hidden="true" size={25} strokeWidth={1.6}/></Link>}
        </div>
      </div>
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
