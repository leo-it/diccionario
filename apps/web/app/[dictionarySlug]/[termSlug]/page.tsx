import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Markdown from "react-markdown";
import { VideoEmbed } from "@/components/video-embed";
import { getPublishedDictionaryBySlug, getPublishedTerm } from "@/lib/api";

export const revalidate = 60;

type Props = {
  params: Promise<{ dictionarySlug: string; termSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dictionarySlug, termSlug } = await params;
  const term = await getPublishedTerm(dictionarySlug, termSlug);

  if (!term) {
    return { title: "Término no encontrado" };
  }

  return {
    title: term.lemma,
    description: term.definition,
  };
}

export default async function TermPage({ params }: Props) {
  const { dictionarySlug, termSlug } = await params;
  const [dictionary, term] = await Promise.all([
    getPublishedDictionaryBySlug(dictionarySlug),
    getPublishedTerm(dictionarySlug, termSlug),
  ]);

  if (!dictionary || !term) {
    notFound();
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl px-6 py-16 font-sans">
      <Link
        href={`/${dictionarySlug}`}
        className="text-sm text-zinc-500 hover:text-zinc-800"
      >
        ← {dictionary.title}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">
        {term.lemma}
      </h1>
      <div className="mt-4 space-y-3 text-zinc-700 [&_a]:underline [&_a]:underline-offset-2 [&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1 [&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-zinc-100 [&_pre]:p-3 [&_ul]:list-disc [&_ul]:pl-5">
        <Markdown>{term.definition}</Markdown>
      </div>
      {term.videoUrl ? (
        <VideoEmbed url={term.videoUrl} title={term.lemma} />
      ) : null}
    </main>
  );
}
