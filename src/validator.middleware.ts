import { type INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as OpenApiValidator from 'express-openapi-validator';
import { type OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

export const useOpenAPIValidator = (
  app: INestApplication,
  apiSpec: string | OpenAPIV3.Document,
) => {
  app.use(bodyParser.json());
  const validators = OpenApiValidator.middleware({
    apiSpec,
    validateRequests: {
      allowUnknownQueryParameters: false,
      coerceTypes: true,
      removeAdditional: true,
    },
    validateResponses: false,
  });
  app.use(validators);
};
