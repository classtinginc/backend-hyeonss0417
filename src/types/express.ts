import { type User } from '@prisma/client';
import { type Request } from 'express';

export type TypedReq<
  T extends {
    params?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    query?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    body?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  } = {}, // eslint-disable-line @typescript-eslint/ban-types
> = Request<T['params'], unknown, T['body'], T['query']> & { user: User };
