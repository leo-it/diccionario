import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedDictionaryBySlug } from "../../lib/api";

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
  const dictionary = await getPublishedDictionaryBySlug(dictionarySlug);

  if (!dictionary) {
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
    </main>
  );
}
