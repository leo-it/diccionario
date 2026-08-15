import { Controller, Get } from '@nestjs/common';
import { ListPublishedDictionariesUseCase } from '../../application/dictionary/list-published-dictionaries.use-case';

@Controller('dictionaries')
export class DictionaryController {
  constructor(
    private readonly listPublished: ListPublishedDictionariesUseCase,
  ) {}

  @Get()
  list() {
    return this.listPublished.execute();
  }
}
