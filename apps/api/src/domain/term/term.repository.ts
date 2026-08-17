import { Term } from './term.entity';

export const TERM_REPOSITORY = Symbol('TERM_REPOSITORY');

export interface TermRepository {
  findPublishedByDictionaryId(dictionaryId: string): Promise<Term[]>;
  findPublishedByDictionaryIdAndSlug(
    dictionaryId: string,
    slug: string,
  ): Promise<Term | null>;
}