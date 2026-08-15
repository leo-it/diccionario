import Link from "next/link";
import { getPublishedDictionaries } from "../lib/api";

export const revalidate = 60;

export default async function Home() {
  const dictionaries = await getPublishedDictionaries();

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">
        Diccionario Multidisciplina
      </h1>
      <p className="mt-2 text-zinc-600">Elegí un diccionario.</p>

      {dictionaries.length === 0 ? (
        <p className="mt-8 text-zinc-500">Todavía no hay diccionarios publicados.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {dictionaries.map((d) => (
            <li key={d.id}>
              <Link
                href={`/${d.slug}`}
                className="block rounded-lg border border-zinc-200 px-4 py-3 hover:bg-zinc-50"
              >
                <span className="font-medium">{d.title}</span>
                <p className="text-sm text-zinc-500">{d.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}