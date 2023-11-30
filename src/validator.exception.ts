import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
} from '@nestjs/common';
import { type Response } from 'express';
import { error } from 'express-openapi-validator';
import { type HttpError } from 'express-openapi-validator/dist/framework/types';

@Catch(...Object.values(error))
export class ValidatorExceptionFilter implements ExceptionFilter {
  catch(err: HttpError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(err.status).json({
      statusCode: err.status,
      message: err.message,
      error: err.name,
      validationErrors: err.errors,
    });
  }
}
