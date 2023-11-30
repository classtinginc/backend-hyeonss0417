import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const email = 'auth@test.com';
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await prisma.user.create({ data: { email } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('이메일로 유저의 토큰을 발급받을 수 있다. (테스트용)', async () => {
    await request(app.getHttpServer())
      .post('/auth/token')
      .send({ email })
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });
});
