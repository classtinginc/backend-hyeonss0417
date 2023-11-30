import { Injectable } from '@nestjs/common';
import { type Post, type User } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { type Transaction } from '../types/prisma';

@Injectable()
export class FeedsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFeed(user: User) {
    const feeds = await this.prismaService.feed.findMany({
      where: { userId: user.id },
      include: { post: { include: { page: true } } },
      orderBy: { post: { createdAt: 'desc' } },
    });

    return { posts: feeds.map((feed) => feed.post) };
  }

  async deliverPostToFeeds(transaction: Transaction, post: Post) {
    const users = await transaction.user.findMany({
      where: {
        pageSubscriptions: { some: { pageId: post.pageId } },
        feeds: { none: { postId: post.id } },
      },
    });

    // NOTE: SQLite does not support bulk insert
    for (const user of users) {
      // eslint-disable-next-line no-await-in-loop
      await transaction.feed.create({
        data: { userId: user.id, postId: post.id, createdAt: post.createdAt },
      });
    }
  }
}
