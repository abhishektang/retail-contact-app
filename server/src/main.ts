import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security: HTTP headers (X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
  app.use(helmet());

  // CORS: Restrict to known origins
  app.enableCors({
    origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 86400, // Cache preflight for 24h
  });

  // Validation: Whitelist, strip unknown props, transform types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // API versioning: Global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
