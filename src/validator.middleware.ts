import { type INestApplication } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import * as OpenApiValidator from 'express-openapi-validator';
import { type OpenAPIV3 } from 'express-openapi-validator/dist/framework/types';

export const useOpenAPIValidator = (
  app: INestApplication,
  apiSpec: string | OpenAPIV3.Document,
  option?: { validateResponses?: boolean },
) => {
  app.use(bodyParser.json());
  const validators = OpenApiValidator.middleware({
    apiSpec,
    validateRequests: {
      allowUnknownQueryParameters: false,
      coerceTypes: true,
      removeAdditional: true,
    },
    validateResponses: option?.validateResponses ?? false,
  });
  app.use(validators);
};
