import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

@Controller('admin')
@UseGuards(AdminGuard)
export class AdminController {
  @Get('me')
  me(
    @Req() request: { user: { uid: string; email?: string } },
  ): { uid: string; email?: string } {
    return request.user;
  }
}
