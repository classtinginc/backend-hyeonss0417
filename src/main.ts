import { NestFactory } from '@nestjs/core';
import { type OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';
import * as swaggerUi from 'swagger-ui-express';
import { generateTspec } from 'tspec';

import { AppModule } from './app.module';
import { useOpenAPIValidator } from './validator.middleware';

const PORT = 80;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const apiSpec = await generateTspec({ configPath: 'tspec.config.json' });
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec));
  useOpenAPIValidator(app, apiSpec as OpenAPIV3.Document);
  app.enableShutdownHooks();
  await app.listen(PORT);
}

void bootstrap();
