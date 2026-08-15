import { Inject, Injectable } from '@nestjs/common';
import { Dictionary } from '../../domain/dictionary/dictionary.entity';
import {
  DICTIONARY_REPOSITORY,
  type DictionaryRepository,
} from '../../domain/dictionary/dictionary.repository';

@Injectable()
export class GetPublishedDictionaryBySlugUseCase {
  constructor(
    @Inject(DICTIONARY_REPOSITORY)
    private readonly dictionaries: DictionaryRepository,
  ) {}

  execute(slug: string): Promise<Dictionary | null> {
    return this.dictionaries.findPublishedBySlug(slug);
  }
}