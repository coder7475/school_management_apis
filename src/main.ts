import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Swagger CDN CSS
const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // enable detailed logging
  });
  const logger = new Logger('Bootstrap');

  // Enable global validation (DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  // CORS setup
  app.enableCors({
    origin: true, // allow all origins
    credentials: true, // allow cookies and authorization headers
  });

  // Cookie parser middleware
  app.use(cookieParser());

  // Config service
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  // Global prefix
  app.setGlobalPrefix('api');

  // Swagger setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Mini School Management API')
    .setDescription('API documentation for the School Management backend')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customCssUrl: CSS_URL,
  });

  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}/api`);
  logger.log(`📖 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap().catch((error) => {
  console.error('Unhandled error during bootstrap:', error);
  process.exit(1);
});
