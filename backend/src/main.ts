import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (!process.env.PORT) throw new Error('Variable de entorno PORT es requerida');
  if (!process.env.CORS_ORIGIN) throw new Error('Variable de entorno CORS_ORIGIN es requerida');

  const allowedOrigins = process.env.CORS_ORIGIN
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = parseInt(process.env.PORT, 10);
  await app.listen(port);
  logger.log(`Servidor Hackeados iniciado en puerto: ${port}`);
}

bootstrap();
