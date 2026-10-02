"use client";

import Link from "next/link";
import { Swords } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePlayButton() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    fetch("/api/game/current", { cache: "no-store" }).then(res => res.json().catch(() => null)).then(data => { if (mounted) setActive(Boolean(data?.active)); }).catch(() => {}).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  return <Link href="/game" className="home-action-card">
    <span className="home-action-icon home-action-play"><Swords size={40} strokeWidth={1.5} /></span>
    <span className="mt-3 text-sm font-medium">{loading ? "Jugar" : active ? "Reanudar" : "Jugar"}</span>
  </Link>;
}