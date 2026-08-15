import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3100',
  });

  const port = Number(process.env.PORT ?? 3101);
  await app.listen(port);
  console.log(`API escuchando en http://localhost:${port}`);
}
bootstrap();
