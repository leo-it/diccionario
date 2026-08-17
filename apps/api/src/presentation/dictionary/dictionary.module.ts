import { Module } from '@nestjs/common';
import { GetPublishedDictionaryBySlugUseCase } from '../../application/dictionary/get-published-dictionary-by-slug.use-case';
import { ListPublishedDictionariesUseCase } from '../../application/dictionary/list-published-dictionaries.use-case';
import { DICTIONARY_REPOSITORY } from '../../domain/dictionary/dictionary.repository';
import { FirestoreDictionaryRepository } from '../../infrastructure/firebase/firestore-dictionary.repository';
import { DictionaryController } from './dictionary.controller';
import { ListPublishedTermsByDictionarySlugUseCase } from '../../application/term/list-published-terms-by-dictionary-slug.use-case';
import { TERM_REPOSITORY } from '../../domain/term/term.repository';
import { GetPublishedTermBySlugsUseCase } from '../../application/term/get-published-term-by-slugs.use-case';
import { FirestoreTermRepository } from '../../infrastructure/firebase/firestore-term.repository';

@Module({
  controllers: [DictionaryController],
  providers: [
    ListPublishedTermsByDictionarySlugUseCase,
    GetPublishedTermBySlugsUseCase,
    {
      provide: TERM_REPOSITORY,
      useClass: FirestoreTermRepository,
    },

    ListPublishedDictionariesUseCase,
    GetPublishedDictionaryBySlugUseCase,
    {
      provide: DICTIONARY_REPOSITORY,
      useClass: FirestoreDictionaryRepository,
    },
  ],
})
export class DictionaryModule { }
