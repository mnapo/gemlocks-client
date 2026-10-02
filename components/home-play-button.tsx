"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePlayButton() {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/game/current", { cache: "no-store" })
      .then((res) => res.json().catch(() => null))
      .then((data) => {
        if (mounted) setActive(Boolean(data?.active));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Link
      href="/game"
      className="mt-8 bg-[#f5f5f5] px-10 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white"
    >
      {loading ? "Jugar" : active ? "Retomar partida" : "Jugar"}
    </Link>
  );
}
