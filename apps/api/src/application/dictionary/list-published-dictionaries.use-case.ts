import { Inject, Injectable } from '@nestjs/common';
import {
  DICTIONARY_REPOSITORY,
  type DictionaryRepository,
} from '../../domain/dictionary/dictionary.repository';
import { Dictionary } from '../../domain/dictionary/dictionary.entity';

@Injectable()
export class ListPublishedDictionariesUseCase {
  constructor(
    @Inject(DICTIONARY_REPOSITORY)
    private readonly dictionaries: DictionaryRepository,
  ) {}

  execute(): Promise<Dictionary[]> {
    return this.dictionaries.findPublished();
  }
}
