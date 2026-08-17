import { Inject, Injectable } from '@nestjs/common';
import {
  DICTIONARY_REPOSITORY,
  type DictionaryRepository,
} from '../../domain/dictionary/dictionary.repository';
import {
  TERM_REPOSITORY,
  type TermRepository,
} from '../../domain/term/term.repository';
import { Term } from '../../domain/term/term.entity';

@Injectable()
export class GetPublishedTermBySlugsUseCase {
  constructor(
    @Inject(DICTIONARY_REPOSITORY)
    private readonly dictionaries: DictionaryRepository,
    @Inject(TERM_REPOSITORY)
    private readonly terms: TermRepository,
  ) {}

  async execute(
    dictionarySlug: string,
    termSlug: string,
  ): Promise<Term | null> {
    const dictionary =
      await this.dictionaries.findPublishedBySlug(dictionarySlug);
    if (!dictionary) {
      return null;
    }
    return this.terms.findPublishedByDictionaryIdAndSlug(
      dictionary.id,
      termSlug,
    );
  }
}
