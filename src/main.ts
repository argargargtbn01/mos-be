import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initTracing } from './tracing';

async function bootstrap() { 
  // await initTracing();
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3003);
}
bootstrap();
