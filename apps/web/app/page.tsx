import Link from "next/link";
import { getPublishedDictionaries } from "../lib/api";

export const revalidate = 60;

export default async function Home() {
  const dictionaries = await getPublishedDictionaries();

  return (
    <main className="site-main">
      <p className="kicker">Léxico abierto</p>
      <h1 className="lemma">Diccionarios</h1>
      <p className="lede">
        Palabras de oficio: tango, circo y lo que venga. Elegí un diccionario.
      </p>

      {dictionaries.length === 0 ? (
        <p className="empty">Todavía no hay diccionarios publicados.</p>
      ) : (
        <ul className="dict-list">
          {dictionaries.map((d) => (
            <li key={d.id}>
              <Link href={`/${d.slug}`} className="dict-card">
                <span className="dict-card-title">{d.title}</span>
                <p className="dict-card-desc">{d.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
