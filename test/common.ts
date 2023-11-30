import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { type PrismaClient, type User } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { useOpenAPIValidator } from '../src/validator.middleware';

export const fakeString = () => Math.random().toString(36).slice(0, 6);

export const fakeEmail = () => `${fakeString()}@test.com'`;

export const fakeDate = () => new Date(Math.random() * 2_000_000_000_000);

export const fakeUser = async (
  app: INestApplication,
  prisma: PrismaClient,
  userInput: { isAdmin: boolean },
): Promise<User & { accessToken: string }> => {
  const userData = { email: fakeEmail(), ...userInput };
  const user = await prisma.user.create({ data: userData });

  const res = await request(app.getHttpServer())
    .post('/auth/signup')
    .send(userData);

  expect(res.status).toBe(200);
  expect(res.body.user.email).toBe(userData.email);
  expect(res.body.accessToken).toBeDefined();
  const accessToken = res.body.accessToken as string;

  return {
    ...user,
    accessToken,
  };
};

export const initApp = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication({ bodyParser: false });
  useOpenAPIValidator(app, 'generated/openapi.json');
  app.enableShutdownHooks();
  await app.init();

  return app;
};
