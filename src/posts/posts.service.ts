import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { FeedsService } from '../feeds/feeds.service';
import { PrismaService } from '../prisma.service';
import { type CreatePost, type UpdatePost } from './types';

@Injectable()
export class PostsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly feedsService: FeedsService,
  ) {}

  async publish(createPostDto: CreatePost) {
    const { pageId, title, content } = createPostDto;

    const post = await this.prismaService.post.create({
      data: {
        title,
        content,
        pageId,
      },
    });

    // NOTE: 응답 지연을 막기 위해 fire-and-forget 패턴으로 구현
    // TODO: 메시지 큐를 사용하여 구현
    this.feedsService
      .deliverPostToFeeds(post.id) // eslint-disable-line @typescript-eslint/no-floating-promises
      .catch((error) => {
        console.error(error);
      });

    return { post };
  }

  async update(id: number, body: UpdatePost) {
    await this.assertPostExists(id);

    const { title, content } = body;
    const post = await this.prismaService.post.update({
      where: { id },
      data: { title, content },
    });

    return { post };
  }

  async remove(id: number) {
    await this.assertPostExists(id);

    await this.prismaService.post.delete({ where: { id } });

    return { ok: true };
  }

  async assertPostExists(id: number) {
    const post = await this.prismaService.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('학교 소식이 존재하지 않습니다.');
    }
  }

  async assertPermissionByPageId(userId: number, pageId: number) {
    const user = await this.prismaService.pageOwnership.findFirst({
      where: { userId, pageId },
    });

    if (!user) {
      throw new ForbiddenException('권한이 없습니다.');
    }
  }

  async assertPermissionByPostId(userId: number, postId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
      select: { page: { select: { id: true } } },
    });

    if (!post) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await this.assertPermissionByPageId(userId, post.page.id);
  }
}
