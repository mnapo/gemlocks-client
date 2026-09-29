import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] px-6 text-[#f5f5f5]">
      <div className="w-full max-w-lg text-center">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-white/35">
          code deduction
        </p>
        <h1 className="mt-5 text-6xl font-medium tracking-[-0.04em] sm:text-7xl">
          gemlocks
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-white/40">
          Descifrá el código. Cerrá el lock.
        </p>

        <div className="mx-auto mt-10 flex max-w-xs flex-col gap-2">
          <Link
            href="/login"
            className="bg-[#f5f5f5] px-5 py-3 text-sm font-medium text-[#0b0b0b] transition hover:bg-white"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/signup"
            className="border border-white/10 px-5 py-3 text-sm text-white/70 transition hover:border-white/25 hover:text-white"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </main>
  );
}
