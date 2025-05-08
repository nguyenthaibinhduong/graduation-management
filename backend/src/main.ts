declare const module: any;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { JwtUtilityService } from './common/jwtUtility.service';
import { EncryptIdInterceptor } from './common/intercepters/encrypt-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({ origin: 'http://localhost:5173', credentials: true });
  const configService = app.get(ConfigService);
  // const jwtUtilityService = app.get(JwtUtilityService); // Lấy từ DI container
  // app.useGlobalInterceptors(new EncryptIdInterceptor(jwtUtilityService));
  const port = configService.get('APP_PORT');
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  await app.listen(port);
  console.log(`Server is running on http://localhost:${port}`);
}
bootstrap();
