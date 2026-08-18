import { Inject, Injectable } from '@nestjs/common';
import { Dictionary } from '../../domain/dictionary/dictionary.entity';
import {
  DICTIONARY_REPOSITORY,
  type DictionaryRepository,
} from '../../domain/dictionary/dictionary.repository';

@Injectable()
export class ListAllDictionariesUseCase {
  constructor(
    @Inject(DICTIONARY_REPOSITORY)
    private readonly dictionaries: DictionaryRepository,
  ) {}

  execute(): Promise<Dictionary[]> {
    return this.dictionaries.findAll();
  }
}
