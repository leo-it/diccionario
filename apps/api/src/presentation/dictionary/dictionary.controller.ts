import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ListPublishedDictionariesUseCase } from '../../application/dictionary/list-published-dictionaries.use-case';
import { GetPublishedDictionaryBySlugUseCase } from '../../application/dictionary/get-published-dictionary-by-slug.use-case';
import { ListPublishedTermsByDictionarySlugUseCase } from '../../application/term/list-published-terms-by-dictionary-slug.use-case';
import { GetPublishedTermBySlugsUseCase } from '../../application/term/get-published-term-by-slugs.use-case';

@Controller('dictionaries')
export class DictionaryController {
  constructor(
    private readonly listPublished: ListPublishedDictionariesUseCase,
    private readonly getBySlugUseCase: GetPublishedDictionaryBySlugUseCase,
    private readonly listTermsUseCase: ListPublishedTermsByDictionarySlugUseCase,
    private readonly getTermUseCase: GetPublishedTermBySlugsUseCase,
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

@Get(':slug/terms')
async listTerms(@Param('slug') slug: string) {
  const terms = await this.listTermsUseCase.execute(slug);
  if (terms === null) {
    throw new NotFoundException();
  }
  return terms;
}

@Get(':slug/terms/:termSlug')
async getTerm(
  @Param('slug') slug: string,
  @Param('termSlug') termSlug: string,
) {
  const term = await this.getTermUseCase.execute(slug, termSlug);
  if (!term) throw new NotFoundException();
  return term;
}
}
