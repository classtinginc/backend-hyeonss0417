import { Injectable, Logger } from '@nestjs/common';
import { Prisma, type User } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { generateChunk, sleep } from '../utils';

@Injectable()
export class FeedsService {
  private readonly logger = new Logger(FeedsService.name);

  readonly DELIVER_POST_TO_FEEDS_RETRY = 3;

  readonly DELIVER_POST_TO_FEEDS_RETRY_INTERVAL = 1000;

  constructor(private readonly prismaService: PrismaService) {}

  async getFeed(user: User) {
    const feeds = await this.prismaService.feed.findMany({
      where: { userId: user.id },
      include: { post: { include: { page: true } } },
      orderBy: { post: { createdAt: 'desc' } },
    });

    return { posts: feeds.map((feed) => feed.post) };
  }

  // TODO: 메시지 큐를 사용하여 구현
  async deliverPostToFeeds(
    postId: number,
    retry = this.DELIVER_POST_TO_FEEDS_RETRY,
  ) {
    try {
      this.logger.debug(`Delivering post ${postId} to feeds...`);
      await this.deliverPostToFeedsInner(postId);
    } catch (error) {
      this.logger.error(`Failed to deliver post ${postId} to feeds`, error);

      if (retry > 0) {
        await sleep(this.DELIVER_POST_TO_FEEDS_RETRY_INTERVAL);
        await this.deliverPostToFeeds(postId, retry - 1);
      }
    }
  }

  async deliverPostToFeedsInner(postId: number) {
    const post = await this.prismaService.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error(`Post ${postId} does not exist`);
    }

    const users = await this.prismaService.user.findMany({
      where: {
        pageSubscriptions: { some: { pageId: post.pageId } },
        feeds: { none: { postId: post.id } },
      },
    });

    for (const chunk of generateChunk(users, 100)) {
      // NOTE: Prisma가 SQLite를 사용할 때는 bulk insert를 지원하지 않기 때문에 $executeRaw를 사용
      // eslint-disable-next-line no-await-in-loop
      await this.prismaService.$executeRaw`
        INSERT INTO "Feed" ("userId", "postId")
        VALUES ${Prisma.join(
          chunk.map((user) => Prisma.sql`(${user.id}, ${postId})`),
        )}
      `;

      this.logger.debug(
        `Delivered post ${postId} to ${chunk.length} users' feeds`,
      );
    }
  }
}
