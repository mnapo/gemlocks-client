"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Globe, Settings, X } from "lucide-react";
import { GLYPH_SETS, type GlyphSetId } from "@/lib/game/glyphs";
import { useI18n } from "@/components/i18n-provider";

type StoreItem = { id: string; name: string; image?: string; preview?: string };
type Props = {
  username: string;
  owned: StoreItem[];
  activeGlyphSet: GlyphSetId;
  activeAvatar: string;
  activeTheme: string;
  activeChest: string;
};

const themes: StoreItem[] = [
  { id: "dark", name: "Dark", preview: "theme-dark" },
  { id: "theme-light", name: "Light", preview: "theme-light" },
  { id: "theme-pink", name: "Pink", preview: "theme-pink" },
  { id: "theme-ocean", name: "Ocean", preview: "theme-ocean" },
];

export default function SettingsModal({ username, owned, activeGlyphSet, activeAvatar, activeTheme, activeChest }: Props) {
  const { language, setLanguage, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"general" | "personalization">("general");
  const [glyphSet, setGlyphSet] = useState<GlyphSetId>(activeGlyphSet);
  const [avatar, setAvatar] = useState(activeAvatar);
  const [theme, setTheme] = useState(activeTheme);
  const [chest, setChest] = useState(activeChest);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const glyphItems: StoreItem[] = [
    { id: "numeric", name: t("numeric"), preview: "0 1 2 3" },
    ...(["emoji", "zodiac", "runes"] as const).filter((id) => owned.some((item) => item.id === ({ emoji: "glyphs-emoji", zodiac: "glyphs-zodiac", runes: "glyphs-runes" }[id]))).map((id) => ({
      id,
      name: GLYPH_SETS[id].name,
      preview: GLYPH_SETS[id].glyphs.slice(0, 4).map((glyph) => glyph.value).join(" "),
    })),
  ];
  const avatarItems: StoreItem[] = [{ id: "", name: t("default"), image: "/store/avatars/predeterminado.svg" }, ...owned.filter((item) => item.id.startsWith("avatar-"))];
  const themeItems = themes.filter((item) => item.id === "dark" || owned.some((ownedItem) => ownedItem.id === item.id));
  const chestItems: StoreItem[] = [{ id: "", name: "common", image: "/store/chests/predeterminado.svg" }, ...owned.filter((item) => item.id.startsWith("chest-"))];

  async function save() {
    setSaving(true); setError(""); setSaved("");
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ glyphSetId: glyphSet, avatarId: avatar, themeId: theme, chestId: chest }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) setError(data?.error ?? t("settingsError"));
    else {
      setSaved(t("settingsSaved"));
      window.dispatchEvent(new CustomEvent("gemlocks:theme-change", { detail: theme.replace("theme-", "") }));
    }
    setSaving(false);
  }

  function Carousel({ title, items, value, onChange }: { title: string; items: StoreItem[]; value: string; onChange: (value: string) => void }) {
    const [start, setStart] = useState(0);
    const selectedIndex = Math.max(0, items.findIndex((item) => item.id === value));
    const visibleCount = 3;
    const maxStart = Math.max(0, items.length - visibleCount);
    const currentStart = Math.min(start, maxStart);
    const currentItems = items.slice(currentStart, currentStart + visibleCount);
    return <section className="mt-7">
      <h3 className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">{title}</h3>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={t("previous") + ": " + title} disabled={currentStart === 0} onClick={() => setStart(Math.max(0, currentStart - 1))} className="flex h-9 w-7 shrink-0 items-center justify-center text-white/50 hover:text-white disabled:opacity-15"><ChevronLeft size={20}/></button>
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
          {currentItems.map((item) => <button key={item.id} type="button" onClick={() => onChange(item.id)} className={"flex min-w-0 flex-col items-center justify-center gap-2 border p-2 transition " + (value === item.id ? "border-white/50 bg-white/[0.07]" : "border-white/10 bg-white/[0.02] hover:border-white/25")}>
            <div className="flex h-14 w-full items-center justify-center overflow-hidden text-xl">
              {item.image ? <img src={item.image} alt="" className="h-14 w-14 object-contain" /> : item.preview?.startsWith("theme-") ? <span className={"h-12 w-12 border border-white/10 " + (item.preview === "theme-light" ? "bg-[linear-gradient(135deg,#f5f5f5_0_33%,#d9d9d9_33%_66%,#fff_66%)]" : item.preview === "theme-pink" ? "bg-[linear-gradient(135deg,#f5f5f5_0_33%,#e8a0c0_33%_66%,#7d365f_66%)]" : item.preview === "theme-ocean" ? "bg-[linear-gradient(135deg,#e9f8ff_0_33%,#58b9d8_33%_66%,#173b55_66%)]" : "bg-[linear-gradient(135deg,#0b0b0b_0_33%,#27272a_33%_66%,#f5f5f5_66%)]")} /> : <span className="text-center text-sm">{item.preview ?? "—"}</span>}
            </div>
            {selectedIndex === items.findIndex((candidate) => candidate.id === item.id) && <span className="h-1 w-5 bg-white/80" />}
          </button>)}
        </div>
        <button type="button" aria-label={t("next") + ": " + title} disabled={currentStart >= maxStart} onClick={() => setStart(Math.min(maxStart, currentStart + 1))} className="flex h-9 w-7 shrink-0 items-center justify-center text-white/50 hover:text-white disabled:opacity-15"><ChevronRight size={20}/></button>
      </div>
    </section>;
  }

  return <>
    <button type="button" aria-label={t("settings")} title={t("settings")} onClick={() => { setOpen(true); setError(""); setSaved(""); }} className="flex h-9 items-center justify-center gap-2 px-2 text-xs text-white/45 transition hover:text-white"><Settings size={17} strokeWidth={1.8}/><span>{t("settings")}</span></button>
    {open && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b0b0b] px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="max-h-full w-full max-w-xl overflow-y-auto border border-white/10 bg-[#111] p-5 sm:p-7">
        <header className="flex items-center justify-between">
          <h2 id="settings-title" className="text-lg font-medium">{t("settings")}</h2>
          <button type="button" aria-label={t("closeSettings")} onClick={() => setOpen(false)} className="flex h-9 w-9 items-center justify-center text-white/45 hover:text-white"><X size={19}/></button>
        </header>
        <div className="mt-5 grid grid-cols-2 border-b border-white/10">
          <button type="button" onClick={() => setTab("general")} className={"border-b-2 px-3 py-3 text-sm " + (tab === "general" ? "border-white/70 text-white" : "border-transparent text-white/35")}>{t("general")}</button>
          <button type="button" onClick={() => setTab("personalization")} className={"border-b-2 px-3 py-3 text-sm " + (tab === "personalization" ? "border-white/70 text-white" : "border-transparent text-white/35")}>{t("personalization")}</button>
        </div>
        {tab === "general" ? <div className="space-y-6 py-6">
          <label className="block"><span className="mb-2 block text-xs text-white/45">{t("nickname")}</span><input value={username} disabled className="w-full border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-white/45 disabled:cursor-not-allowed" /></label>
          <label className="block"><span className="mb-2 flex items-center gap-2 text-xs text-white/45"><Globe size={15}/> {t("language")}</span><select value={language} onChange={(event) => setLanguage(event.target.value as "en" | "es" | "es-AR")} className="w-full appearance-none border border-white/10 bg-[#171717] px-3 py-3 text-sm text-white"><option value="en">English</option><option value="es">Español</option><option value="es-AR">Español (Argentina)</option></select></label>
        </div> : <div className="py-2">
          <Carousel title={t("glyphSet")} items={glyphItems} value={glyphSet} onChange={(value) => setGlyphSet(value as GlyphSetId)} />
          <Carousel title={t("avatar")} items={avatarItems} value={avatar} onChange={setAvatar} />
          <Carousel title={t("theme")} items={themeItems} value={theme} onChange={setTheme} />
          <Carousel title={t("chest")} items={chestItems} value={chest} onChange={setChest} />
        </div>}
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {saved && <p className="mt-4 text-sm text-emerald-400">{saved}</p>}
        {tab === "personalization" && <button type="button" disabled={saving} onClick={save} className="mt-6 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] disabled:opacity-40">{saving ? t("saving") : t("saveChanges")}</button>}
      </div>
    </div>}
  </>;
}
