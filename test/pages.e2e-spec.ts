import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const email = 'pages@test.com';
    await prisma.user.create({ data: { email, isAdmin: true } });
    adminToken = await request(app.getHttpServer())
      .post('/auth/token')
      .send({ email })
      .expect(200)
      .then((res) => res.body.accessToken as string);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('학교 관리자는 지역, 학교명으로 학교 페이지를 생성할 수 있다.', async () => {
    await request(app.getHttpServer())
      .post('/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ location: '서울', schoolName: '서울대학교' })
      .expect(201)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const page = res.body.page;
        expect(page.location).toBe('서울');
        expect(page.schoolName).toBe('서울대학교');
      });
  });

  it('유저는 학교 페이지 목록을 조회할 수 있다.', async () => {
    await request(app.getHttpServer())
      .get('/pages')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const pages = res.body.pages;
        expect(pages.length).toBeGreaterThan(0);
        expect(pages[0].location).toBeDefined();
        expect(pages[0].schoolName).toBeDefined();
      });
  });
});
