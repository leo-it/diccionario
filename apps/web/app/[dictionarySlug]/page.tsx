import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedDictionaryBySlug, getPublishedTerms } from "@/lib/api";

export const revalidate = 60;

type Props = {
  params: Promise<{ dictionarySlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dictionarySlug } = await params;
  const dictionary = await getPublishedDictionaryBySlug(dictionarySlug);

  if (!dictionary) {
    return { title: "Diccionario no encontrado" };
  }

  return {
    title: dictionary.title,
    description: dictionary.description,
  };
}

export default async function DictionaryPage({ params }: Props) {
  const { dictionarySlug } = await params;
  const [dictionary, terms] = await Promise.all([
    getPublishedDictionaryBySlug(dictionarySlug),
    getPublishedTerms(dictionarySlug),
  ]);

  if (!dictionary || terms === null) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16 font-sans">
      <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-800">
        ← Todos los diccionarios
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {dictionary.title}
      </h1>
      <p className="mt-2 text-zinc-600">{dictionary.description}</p>
      {terms.length === 0 ? (
        <p className="mt-8 text-zinc-500">Todavía no hay términos.</p>
      ) : (
        <ul className="mt-8 space-y-2">
          {terms.map((t) => (
            <li key={t.id}>
              <Link
                href={`/${dictionarySlug}/${t.slug}`}
                className="text-zinc-800 underline-offset-2 hover:underline"
              >
                {t.lemma}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
