import { type PrismaClient } from '@prisma/client';

export type Transaction = PrismaClient['$transaction'] extends (
  fn: (prisma: infer T) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
  options?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
) => any // eslint-disable-line @typescript-eslint/no-explicit-any
  ? T
  : never;
