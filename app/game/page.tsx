"use client";

import { useState } from "react";
import Link from "next/link";
import { DIFFICULTIES, type DifficultyLevel } from "@/lib/game/difficulty";

export default function GamePage() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(3);

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col">
        <header className="flex items-center justify-between border-b border-white/10 py-5">
          <Link href="/" className="text-sm font-medium tracking-tight">
            gemlocks
          </Link>
          <Link href="/" className="text-xs text-white/40 transition hover:text-white/75">
            Volver
          </Link>
        </header>

        <section className="flex flex-1 flex-col justify-center py-12">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/35">
              jugador vs máquina
            </p>
            <h1 className="mt-4 text-3xl font-medium tracking-tight">
              Elegí la dificultad
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/40">
              Cinco niveles configurables para definir cómo juega la máquina.
            </p>
          </div>

          <div className="mt-10 grid gap-2">
            {DIFFICULTIES.map((option) => {
              const selected = difficulty === option.level;

              return (
                <button
                  key={option.level}
                  type="button"
                  onClick={() => setDifficulty(option.level)}
                  className={`flex items-center justify-between border px-4 py-4 text-left transition ${
                    selected
                      ? "border-white/40 bg-white/[0.07]"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">
                      {option.level}. {option.name}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-white/40">
                      {option.description}
                    </span>
                  </span>
                  <span
                    className={`ml-4 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                      selected ? "border-white/80" : "border-white/25"
                    }`}
                  >
                    {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="mt-8 w-full bg-[#f5f5f5] px-4 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white"
          >
            Comenzar partida
          </button>
        </section>
      </div>
    </main>
  );
}
