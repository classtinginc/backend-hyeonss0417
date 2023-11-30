import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../src/prisma.service';
import { fakeDate, fakeString, fakeUser, initApp } from './common';

describe('Feeds (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaService();

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /feeds', () => {
    it('학교 페이지를 구독하는 시점 이후 소식부터 뉴스피드를 받는다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const subscribedAt = new Date();
      const subscribedPage = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } }, subscribedAt },
          },
        },
      });
      const dayAgo = new Date(subscribedAt.setDate(subscribedAt.getDate() - 1));
      await prisma.post.create({
        data: {
          pageId: subscribedPage.id,
          title: '제목',
          content: '내용',
          createdAt: dayAgo,
        },
      });
      const newPostData = {
        pageId: subscribedPage.id,
        title: '제목2',
        content: '내용2',
      };

      // When
      const postRes = await request(app.getHttpServer())
        .post(`/posts`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(newPostData);
      const feedRes = await request(app.getHttpServer())
        .get(`/feeds`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(postRes.status).toBe(201);
      expect(feedRes.status).toBe(200);
      expect(feedRes.body.posts.length).toBe(1);
      expect(feedRes.body.posts[0].id).toBe(postRes.body.post.id);
    });

    it('뉴스피드는 최신순으로 소식을 노출한다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });
      await Promise.all(
        Array.from({ length: 10 }).map(() =>
          prisma.feed.create({
            data: {
              user: { connect: { id: student.id } },
              post: {
                create: {
                  pageId: page.id,
                  title: fakeString(),
                  content: fakeString(),
                  createdAt: fakeDate(),
                },
              },
            },
          }),
        ),
      );

      // When
      const res = await request(app.getHttpServer())
        .get(`/feeds`)
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

    it('학교 페이지 구독을 취소해도 기존 뉴스피드에 나타난 소식은 유지한다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const unsubscribedPage = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });
      const feedPost = await prisma.post.create({
        data: {
          pageId: unsubscribedPage.id,
          title: fakeString(),
          content: fakeString(),
          feeds: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });

      // When
      const res = await request(app.getHttpServer())
        .get(`/feeds`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.posts.length).toBe(1);
      expect(res.body.posts[0].id).toBe(feedPost.id);
    });
  });
});
