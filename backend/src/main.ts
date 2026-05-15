import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DecimalSerializerInterceptor } from './common/interceptors/decimal-serializer.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port', 3000);
  const env = config.get<string>('app.env', 'development');

  app.use(helmet());
  app.use(cookieParser());

  // CORS: nếu corsOrigins là ['*'] → reflect origin (cookie cross-site cần origin cụ thể).
  // Dev: WEB_URL=http://localhost:3001 + MOBILE_URL=... Prod: list domain thật.
  const corsOrigins = config.get<string[]>('app.corsOrigins', ['*']);
  const allowAll = corsOrigins.length === 1 && corsOrigins[0] === '*';
  app.enableCors({
    origin: allowAll
      ? (origin, cb) => cb(null, origin ?? true)
      : corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  });
  app.setGlobalPrefix('api', { exclude: ['health', 'health/(.*)'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new DecimalSerializerInterceptor());

  if (env !== 'production') {
    const docConfig = new DocumentBuilder()
      .setTitle('Sports Booking API')
      .setDescription('REST API for sports field booking platform')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, docConfig);
    SwaggerModule.setup('docs', app, document);
  }

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API ready on http://localhost:${port}  (docs: /docs)`);
}

bootstrap();
