import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import { LoggerUtil } from './common/utils/logger.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ limit: '5mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Niyaku API')
    .setDescription('The Niyaku API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  LoggerUtil.info('Creating Swagger document...', 'Bootstrap');
  const document = SwaggerModule.createDocument(app, config);
  LoggerUtil.info('Swagger document created', 'Bootstrap');

  LoggerUtil.info('Setting up Swagger at /docs...', 'Bootstrap');
  SwaggerModule.setup('docs', app, document);
  LoggerUtil.info('Swagger setup complete', 'Bootstrap');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  LoggerUtil.info(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  LoggerUtil.info(
    `Swagger docs available at: http://localhost:${port}/api/docs`,
    'Bootstrap',
  );
}

bootstrap().catch((e: Error) => {
  LoggerUtil.logError(e, 'Bootstrap');
  process.exit(1);
});
