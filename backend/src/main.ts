declare const module: any;
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { JwtUtilityService } from './common/jwtUtility.service';
import { EncryptIdInterceptor } from './common/intercepters/encrypt-id.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT');
  app.use(cookieParser());
  app.enableCors({ origin: configService.get('APP_FRONTEND_URL'), credentials: true });
  const jwtUtilityService = app.get(JwtUtilityService); // Lấy từ DI container
  app.useGlobalInterceptors(new EncryptIdInterceptor(jwtUtilityService));
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  await app.listen(port);
  console.log(`Server is running on Port :${port}`);
}
bootstrap();
