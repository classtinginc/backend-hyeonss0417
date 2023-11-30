import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../src/prisma.service';
import { fakeDate, fakeString, fakeUser, initApp } from './common';

describe('Subscriptions (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaService();
  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
  describe('GET /subscriptions/pages', () => {
    it('학생은 구독 중인 학교 페이지 목록을 조회할 수 있다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .get('/subscriptions/pages')
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.pages.length).toBe(1);
      expect(res.body.pages[0].id).toBe(page.id);
      expect(res.body.pages[0].location).toBe(page.location);
      expect(res.body.pages[0].schoolName).toBe(page.schoolName);
    });
  });

  describe('POST /subscriptions/pages/{pageId}', () => {
    it('학생은 학교 페이지를 구독할 수 있다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });

      // When
      const res = await request(app.getHttpServer())
        .post(`/subscriptions/pages/${page.id}`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(201);
      expect(res.body.subscription.userId).toBe(student.id);
      expect(res.body.subscription.pageId).toBe(page.id);
    });
  });

  describe('DELETE /subscriptions/pages/{pageId}', () => {
    it('학생은 학교 페이지 구독을 취소할 수 있다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const subscribedPage = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .delete(`/subscriptions/pages/${subscribedPage.id}`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(204);
      const subscriptions = await prisma.pageSubscription.findMany({
        where: { userId: student.id },
      });
      expect(subscriptions.length).toBe(0);
    });
  });

  describe('GET /subscriptions/{pageId}/posts', () => {
    it('유저는 구독 중인 학교 페이지의 소식 목록을 조회할 수 있다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const subscribedPage = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });
      const post = await prisma.post.create({
        data: {
          pageId: subscribedPage.id,
          title: fakeString(),
          content: fakeString(),
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/subscriptions/pages/${subscribedPage.id}/posts`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(1);
      expect(res.body.posts[0].id).toBe(post.id);
    });

    it('학교별 소식은 최신순으로 노출해해야 한다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });
      await Promise.all(
        Array.from({ length: 10 }).map(() =>
          prisma.post.create({
            data: {
              pageId: page.id,
              title: fakeString(),
              content: fakeString(),
              createdAt: fakeDate(),
            },
          }),
        ),
      );

      // When
      const res = await request(app.getHttpServer())
        .get(`/subscriptions/pages/${page.id}/posts`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(10);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const createdAts = res.body.posts.map((p) => new Date(p.createdAt));
      expect(createdAts).toEqual(
        createdAts.sort((a, b) => b.getTime() - a.getTime()),
      );
    });

    it('유저는 구독 중이 아닌 학교 페이지별 소식을 볼 수 없다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const nonSubscribedPage = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/subscriptions/pages/${nonSubscribedPage.id}/posts`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(403);
    });
  });
});
