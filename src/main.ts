import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { MediaTransformInterceptor } from './common/interceptors/media-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors()
  app.setGlobalPrefix('api');
  
  app.enableVersioning({
    type: VersioningType.URI,
  })

  app.useGlobalInterceptors(new MediaTransformInterceptor());

  await app.listen(3000);
}
bootstrap();
