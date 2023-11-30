import { type Controller } from '@nestjs/common/interfaces';

type ResponseType<
  T extends Controller,
  K extends keyof T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : string;

interface OpenApiValidationError {
  statusCode: number;
  message: string;
  error: string;
  validatorErrors: Array<{
    path: string;
    message: string;
  }>;
}

export interface Operation<
  Summary extends string,
  T extends Controller,
  K extends keyof T,
  ResCode extends number = 200,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OtherRes = { [resCode: number]: any },
> {
  summary: Summary;
  handler: T[K];
  responses: { [key in ResCode]: ResponseType<T, K> } & {
    400: OpenApiValidationError;
  } & OtherRes;
}

export interface NotFound {
  statusCode: 404;
  message: string;
}
