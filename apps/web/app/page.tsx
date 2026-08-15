const apiUrl = process.env.API_URL ?? "http://localhost:3101";

export const dynamic = "force-dynamic";

export default async function Home() {
  let health: { status?: string } | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) {
      error = `La API respondió ${res.status}`;
    } else {
      health = await res.json();
    }
  } catch {
    error =
      "No se pudo hablar con Nest. ¿Está corriendo `pnpm dev:api` en el puerto 3101?";
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 px-6 font-sans">
      <p className="text-sm uppercase tracking-wide text-zinc-500">
        Hito 3 — hop Next → Nest
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">
        Diccionario Multidisciplina
      </h1>
      {health?.status === "ok" ? (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-emerald-800">
          API status: <strong>{health.status}</strong>
        </p>
      ) : (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-amber-900">
          {error ?? "Estado desconocido"}
        </p>
      )}
      <p className="text-sm text-zinc-500">
        Seguí el resto de los hitos en{" "}
        <code className="rounded bg-zinc-100 px-1">INSTRUCCIONES.md</code>
      </p>
    </main>
  );
}
