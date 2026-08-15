import { Module } from '@nestjs/common';
import { GetPublishedDictionaryBySlugUseCase } from '../../application/dictionary/get-published-dictionary-by-slug.use-case';
import { ListPublishedDictionariesUseCase } from '../../application/dictionary/list-published-dictionaries.use-case';
import { DICTIONARY_REPOSITORY } from '../../domain/dictionary/dictionary.repository';
import { FirestoreDictionaryRepository } from '../../infrastructure/firebase/firestore-dictionary.repository';
import { DictionaryController } from './dictionary.controller';

@Module({
  controllers: [DictionaryController],
  providers: [
    ListPublishedDictionariesUseCase,
    GetPublishedDictionaryBySlugUseCase,
    {
      provide: DICTIONARY_REPOSITORY,
      useClass: FirestoreDictionaryRepository,
    },
  ],
})
export class DictionaryModule {}
