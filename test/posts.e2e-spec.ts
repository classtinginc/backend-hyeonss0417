import { type INestApplication } from '@nestjs/common';
import request from 'supertest';

import { PrismaService } from '../src/prisma.service';
import { sleep } from '../src/utils';
import { fakeString, fakeUser, initApp } from './common';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  const prisma = new PrismaService();

  beforeAll(async () => {
    app = await initApp();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /posts', () => {
    it('페이지 권한을 가진 관리자는 학교 소식을 발행할 수 있다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
        },
      });
      const post = { pageId: page.id, title: '제목', content: '내용' };

      // When
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(post);

      // Then
      expect(res.status).toBe(201);
      expect(res.body.post.title).toBe(post.title);
      expect(res.body.post.content).toBe(post.content);
    });

    it('페이지 권한을 가진 관리자 이외의 유저는 학교 소식을 발행할 수 없다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });
      const post = { pageId: page.id, title: '제목', content: '내용' };

      // When
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${student.accessToken}`)
        .send(post);

      // Then
      expect(res.status).toBe(403);
    });

    it('소식이 발행되면 구독 중인 학생들의 피드에 소식이 추가되어야 한다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });
      const post = { pageId: page.id, title: '제목', content: '내용' };

      // When
      const res = await request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(post);
      // NOTE: 피드에 추가하는 로직이 fire-and-forget 패턴으로 구현되어 있기 때문에 1초 대기
      await sleep(1000);

      // Then
      expect(res.status).toBe(201);
      const feeds = await prisma.feed.findMany({
        where: { userId: student.id },
      });
      expect(feeds.length).toBe(1);
      expect(feeds[0].postId).toBe(res.body.post.id);
    });
  });

  describe('DELETE /posts/{postId}', () => {
    it('페이지 권한을 가진 관리자는 학교 소식을 삭제할 수 있다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
        },
      });
      const post = await prisma.post.create({
        data: { pageId: page.id, title: '제목', content: '내용' },
      });

      // When
      const res = await request(app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`);

      // Then
      expect(res.status).toBe(204);
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).toBeNull();
    });

    it('페이지 권한을 가진 관리자 이외의 유저는 학교 소식을 삭제할 수 없다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });
      const post = await prisma.post.create({
        data: { pageId: page.id, title: '제목', content: '내용' },
      });

      // When
      const res = await request(app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${student.accessToken}`);

      // Then
      expect(res.status).toBe(403);
      const deletedPost = await prisma.post.findUnique({
        where: { id: post.id },
      });
      expect(deletedPost).not.toBeNull();
    });

    it('소식이 삭제되면 구독 중인 학생들의 피드에서도 소식이 삭제되어야 한다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
          pageSubscriptions: {
            create: { user: { connect: { id: student.id } } },
          },
        },
      });
      const post = await prisma.post.create({
        data: { pageId: page.id, title: '제목', content: '내용' },
      });

      // When
      const res = await request(app.getHttpServer())
        .delete(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`);

      // Then
      expect(res.status).toBe(204);
      const feeds = await prisma.feed.findMany({
        where: { userId: student.id },
      });
      expect(feeds.length).toBe(0);
    });
  });

  describe('PATCH /posts/{postId}', () => {
    it('학교 관리자는 학교 소식을 수정할 수 있다.', async () => {
      // Given
      const admin = await fakeUser(app, prisma, { isAdmin: true });
      const page = await prisma.page.create({
        data: {
          location: fakeString(),
          schoolName: fakeString(),
          pageOwnerships: {
            create: { user: { connect: { id: admin.id } } },
          },
        },
      });
      const post = await prisma.post.create({
        data: { pageId: page.id, title: '제목', content: '내용' },
      });
      const editData = { title: fakeString(), content: fakeString() };

      // When
      const res = await request(app.getHttpServer())
        .patch(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${admin.accessToken}`)
        .send(editData);

      // Then
      expect(res.status).toBe(200);
      expect(res.body.post.title).toBe(editData.title);
      expect(res.body.post.content).toBe(editData.content);
    });

    it('학교 관리자 이외의 유저는 학교 소식을 수정할 수 없다.', async () => {
      // Given
      const student = await fakeUser(app, prisma, { isAdmin: false });
      const page = await prisma.page.create({
        data: { location: fakeString(), schoolName: fakeString() },
      });
      const post = await prisma.post.create({
        data: { pageId: page.id, title: '제목', content: '내용' },
      });

      // When
      const res = await request(app.getHttpServer())
        .patch(`/posts/${post.id}`)
        .set('Authorization', `Bearer ${student.accessToken}`)
        .send({ title: '제목3', content: '내용3' });

      // Then
      expect(res.status).toBe(403);
    });
  });
});
