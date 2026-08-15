import { Module } from '@nestjs/common';
import { HealthController } from './presentation/health/health.controller';

@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
