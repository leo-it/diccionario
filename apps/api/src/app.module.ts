import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { DictionaryModule } from './presentation/dictionary/dictionary.module';
import { AdminController } from './presentation/admin/admin.controller';
import { AdminGuard } from './presentation/admin/admin.guard';
import { HealthController } from './presentation/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    FirebaseModule,
    DictionaryModule,
  ],
  controllers: [HealthController, AdminController],
  providers: [AdminGuard],
})
export class AppModule {}