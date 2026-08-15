import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './infrastructure/firebase/firebase.module';
import { DictionaryModule } from './presentation/dictionary/dictionary.module';
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
  controllers: [HealthController],
})
export class AppModule {}