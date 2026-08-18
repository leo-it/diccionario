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
    <main className="site-main">
      <Link href="/" className="back-link">
        ← Todos los diccionarios
      </Link>
      <h1 className="lemma">{dictionary.title}</h1>
      <p className="lede">{dictionary.description}</p>
      {terms.length === 0 ? (
        <p className="empty">Todavía no hay términos.</p>
      ) : (
        <ul className="term-list">
          {terms.map((t) => (
            <li key={t.id}>
              <Link
                href={`/${dictionarySlug}/${t.slug}`}
                className="term-row"
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
