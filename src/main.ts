import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  dotenv.config();

  const config = new DocumentBuilder()
    .setTitle('Foreign Exchange Query Language Parser')
    .setDescription('API documentation for FXQL service')
    .setVersion('1.0')
    .addTag('fxql')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);


  await app.listen(process.env.PORT || 5000 );
}
bootstrap();
