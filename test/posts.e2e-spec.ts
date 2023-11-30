import { type INestApplication } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let pageId: number;
  let postId: number;
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const page = await prisma.page.create({
      data: {
        location: '서울',
        schoolName: '이화여자대학교',
      },
    });
    pageId = page.id;

    const email = 'test@test.com';
    await prisma.user.create({
      data: {
        email,
        isAdmin: true,
        pageOwnerships: {
          create: {
            page: { connect: { id: pageId } },
          },
        },
      },
    });
    adminToken = await request(app.getHttpServer())
      .post('/auth/token')
      .send({ email })
      .expect(200)
      .then((res) => res.body.accessToken as string);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('학교 관리자는 학교 페이지 내에 소식을 작성할 수 있다.', async () => {
    await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ pageId, title: '제목', content: '내용' })
      .expect(201)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const post = res.body.post;
        expect(post.pageId).toBeGreaterThan(0);
        expect(post.title).toBe('제목');
        expect(post.content).toBe('내용');
        postId = post.id as number;
      });
  });

  it('학교 관리자는 작성된 소식을 수정할 수 있다.', async () => {
    await request(app.getHttpServer())
      .patch(`/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '수정된 제목', content: '수정된 내용' })
      .expect(200)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const post = res.body.post;
        expect(post.title).toBe('수정된 제목');
        expect(post.content).toBe('수정된 내용');
      });
  });

  it('학교 관리자는 작성된 소식을 삭제할 수 있다.', async () => {
    await request(app.getHttpServer())
      .delete(`/posts/${postId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    expect(await prisma.post.findUnique({ where: { id: postId } })).toBeNull();
  });
});
