import { type INestApplication } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { fakeString, fakeUser, initApp } from './common';

describe('Pages (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    app = await initApp();
  });
  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /pages', () => {
    it('학교 관리자는 지역, 학교명으로 학교 페이지를 생성할 수 있다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const page = { location: fakeString(), schoolName: fakeString() };

      // When
      const res = await request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(page);

      // Then
      expect(res.status).toBe(201);
      expect(res.body.page.location).toBe(page.location);
      expect(res.body.page.schoolName).toBe(page.schoolName);
    });

    it('학교 관리자 이외의 유저는 학교 페이지를 생성할 수 없다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = { location: fakeString(), schoolName: fakeString() };

      // When
      const res = await request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${student.accessToken}`)
        .send(page);

      // Then
      expect(res.status).toBe(403);
    });

    it('지역과 학교명이 동일한 학교 페이지는 생성할 수 없다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const school = { location: fakeString(), schoolName: fakeString() };
      await prisma.page.create({ data: school });

      // When
      const res = await request(app.getHttpServer())
        .post('/pages')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(school);

      // Then
      expect(res.status).toBe(400);
    });
  });

  describe('GET /pages', () => {
    it('유저는 전체 학교 페이지 목록을 조회할 수 있다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/pages')
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.pages.length).toBeGreaterThan(0);
      expect(res.body.pages[0].location).toBeDefined();
      expect(res.body.pages[0].schoolName).toBeDefined();
    });
  });
});
