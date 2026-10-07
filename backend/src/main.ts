import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  // Global exception filter for secure error handling and logging
  app.useGlobalFilters(new AllExceptionsFilter());


  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('AI Recruitment Pipeline API')
    .setDescription(
      'Plataforma de recrutamento assistida por IA — documentação da API REST',
    )
    .setVersion('1.0')
    .addTag('jobs', 'Gestão de vagas')
    .addTag('candidates', 'Gestão de candidatos')
    .addTag('resumes', 'Upload e gestão de currículos')
    .addTag('screening', 'Triagem por IA')
    .addTag('tests', 'Testes e questões')
    .addTag('ranking', 'Ranking de candidatos')
    .addTag('interviews', 'Agendamento de entrevistas')
    .addTag('dashboard', 'Métricas e indicadores')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 API running on: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
