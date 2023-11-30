import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../src/prisma.service';
import { fakeEmail, initApp } from './common';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaService();

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/signup', () => {
    it('이메일과 관리자 여부를 입력받아 유저를 생성하고 토큰을 발급한다.', async () => {
      // Given
      const email = fakeEmail();

      // When
      const res = await request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email, isAdmin: true });

      // Then
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(email);
      expect(res.body.user.isAdmin).toBe(true);
      expect(res.body.accessToken).toBeDefined();
    });
  });
});
