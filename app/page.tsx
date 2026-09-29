import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="text-6xl font-semibold tracking-tight">Gemlocks</h1>
        <p className="mt-3 opacity-60">Code deduction, one lock at a time.</p>
        <div className="mt-10 flex flex-col gap-3">
          <Link href="/login" className="rounded-xl bg-foreground px-5 py-3 text-background">Iniciar sesión</Link>
          <Link href="/signup" className="rounded-xl border px-5 py-3">Crear cuenta</Link>
        </div>
      </div>
    </main>
  );
}
