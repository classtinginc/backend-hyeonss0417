import { Injectable } from '@nestjs/common';
import { type Post, type User } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class FeedsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getFeed(user: User) {
    const feeds = await this.prismaService.feed.findMany({
      where: { userId: user.id },
      include: { post: { include: { page: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { posts: feeds.map((feed) => feed.post) };
  }

  async deliverFeed(post: Post) {
    const subscriptions = await this.prismaService.pageSubscription.findMany({
      where: { pageId: post.pageId },
    });

    // NOTE: SQLite does not support bulk insert
    const inserts = subscriptions.map((subscription) =>
      this.prismaService.feed.create({
        data: { userId: subscription.userId, postId: post.id },
      }),
    );
    await this.prismaService.$transaction(inserts);

    return { ok: true };
  }
}
