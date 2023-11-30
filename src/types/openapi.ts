type ErrorCode = 400 | 401 | 403 | 404 | 500;

interface Error {
  statusCode: ErrorCode;
  message: string;
  [key: string]: unknown;
}

/** BadRequest */
export interface BadRequestError extends Error {
  statusCode: 400;
  message: string;
  error: 'Bad Request';
  /** OpenAPI validation errors */
  validationErrors?: Array<{
    path: string;
    message: string;
  }>;
}

/** Unauthorized */
export interface UnauthorizedError extends Error {
  statusCode: 401;
  error: 'Unauthorized';
  message: string;
}

/** Forbidden */
export interface ForbiddenError extends Error {
  statusCode: 403;
  error: 'Forbidden';
  message: string;
}

/** NotFound */
export interface NotFoundError extends Error {
  statusCode: 404;
  error: 'Not Found';
  message: string;
}

/** InternalServerError */
export interface ServerError extends Error {
  statusCode: 500;
  error: 'Internal Server Error';
  message: string;
}

type ToErrorMap<T extends Error> = {
  [key in T['statusCode']]: T extends { statusCode: key } ? T : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ControllerMethod = (...args: any[]) => any;

type ResponseType<F extends ControllerMethod> = Awaited<ReturnType<F>>;

type CommonError = BadRequestError | UnauthorizedError | ServerError;

export interface Operation<
  Summary extends string,
  M extends ControllerMethod,
  ResCode extends number = 200,
  ResError extends Error = never,
> {
  summary: Summary;
  handler: M;
  responses: {
    [key in ResCode]: ResponseType<M>;
  } & ToErrorMap<ResError | CommonError>;
}
