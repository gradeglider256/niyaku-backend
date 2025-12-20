import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Niyaku API')
    .setDescription('The Niyaku API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  console.log('Creating Swagger document...');
  const document = SwaggerModule.createDocument(app, config);
  console.log('Swagger document created');

  console.log('Setting up Swagger at /docs...');
  SwaggerModule.setup('docs', app, document);
  console.log('Swagger setup complete');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`Swagger docs available at: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
// eslint-disable-next-line prettier/prettier
bootstrap().catch((e: any) => console.error(e));
