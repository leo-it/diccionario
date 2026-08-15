import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ListPublishedDictionariesUseCase } from '../../application/dictionary/list-published-dictionaries.use-case';
import { GetPublishedDictionaryBySlugUseCase } from '../../application/dictionary/get-published-dictionary-by-slug.use-case';

@Controller('dictionaries')
export class DictionaryController {
  constructor(
    private readonly listPublished: ListPublishedDictionariesUseCase,
    private readonly getBySlugUseCase: GetPublishedDictionaryBySlugUseCase,

  ) {}

  @Get()
  list() {
    return this.listPublished.execute();
  }
  @Get(':slug')
async getBySlug(@Param('slug') slug: string) {
  const dictionary = await this.getBySlugUseCase.execute(slug);
  if (!dictionary) {
    throw new NotFoundException();
  }
  return dictionary;
}
}
