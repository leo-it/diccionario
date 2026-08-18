import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListAllDictionariesUseCase } from '../../application/dictionary/list-all-dictionaries.use-case';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  constructor(private readonly listAll: ListAllDictionariesUseCase) {}

  @Get('me')
  me(
    @Req() request: { user: { uid: string; email?: string } },
  ): { uid: string; email?: string } {
    return request.user;
  }

  @Get('dictionaries')
  listDictionaries() {
    return this.listAll.execute();
  }
}
