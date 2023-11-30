import { NestFactory } from '@nestjs/core';
import * as swaggerUi from 'swagger-ui-express';
import { generateTspec } from 'tspec';

import { AppModule } from './app.module';

const PORT = 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const apiSpec = await generateTspec({
    specPathGlobs: ['src/**/*.controller.ts'],
    outputPath: './src/generate/openapi.json',
    specVersion: 3,
    openapi: {
      title: 'Tspec API',
      version: '0.0.1',
      securityDefinitions: {
        jwt: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
  app.enableShutdownHooks();
  await app.listen(PORT);
}

void bootstrap();
