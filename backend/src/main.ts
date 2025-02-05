declare const module: any;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
