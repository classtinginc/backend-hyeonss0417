import { type Controller } from '@nestjs/common/interfaces';

export type ResponseType<
  T extends Controller,
  K extends keyof T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
> = T[K] extends (...args: any[]) => any ? Awaited<ReturnType<T[K]>> : string;
