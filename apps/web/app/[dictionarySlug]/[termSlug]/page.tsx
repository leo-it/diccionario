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
    <main className="site-main">
      <Link href={`/${dictionarySlug}`} className="back-link">
        ← Volver a {dictionary.title}
      </Link>
      <h1 className="lemma">{term.lemma}</h1>
      <div className="prose-term">
        <Markdown>{term.definition}</Markdown>
      </div>
      {term.videoUrl ? (
        <VideoEmbed url={term.videoUrl} title={term.lemma} />
      ) : null}
    </main>
  );
}
