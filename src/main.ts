import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  // Set global API version prefix
  app.setGlobalPrefix('v1');

  // Enable global validation pipe to enforce DTO decorators
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  dotenv.config();
  
  const config = new DocumentBuilder()
    .setTitle('Foreign Exchange Query Language Parser')
    .setDescription('API documentation for FXQL service')
    .setVersion('1.0')
    .addTag('fxql')
    .addApiKey(
      { type: 'apiKey', name: 'x-api-key', in: 'header' },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  await app.listen(process.env.PORT || 5000 );
}
bootstrap();
