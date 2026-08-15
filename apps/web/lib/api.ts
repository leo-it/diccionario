const apiUrl = process.env.API_URL ?? "http://localhost:3101";

export type Dictionary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  published: boolean;
};

export async function getPublishedDictionaries(): Promise<Dictionary[]> {
  const res = await fetch(`${apiUrl}/dictionaries`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status} al pedir /dictionaries`);
  }

  return res.json();
}

export async function getPublishedDictionaryBySlug(
  slug: string,
): Promise<Dictionary | null> {
  const res = await fetch(`${apiUrl}/dictionaries/${slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`API ${res.status} al pedir /dictionaries/${slug}`);
  }

  return res.json();
}