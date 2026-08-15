export type Dictionary = {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export type Term = {
  id: string;
  dictionaryId: string;
  lemma: string;
  slug: string;
  definition: string;
  videoUrl?: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};
