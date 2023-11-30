import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { type User } from '@prisma/client';

import { PrismaService } from '../prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async subscribePage(user: User, pageId: number) {
    await this.assertPageExists(pageId);

    const exist = await this.prismaService.pageSubscription.findFirst({
      where: { userId: user.id, pageId },
    });

    if (exist) {
      return { subscription: exist };
    }

    const subscription = await this.prismaService.pageSubscription.create({
      data: { userId: user.id, pageId },
    });

    return { subscription };
  }

  async getSubscriptionPages(user: User) {
    const subscriptions = await this.prismaService.pageSubscription.findMany({
      where: { userId: user.id },
      include: { page: true },
      orderBy: { subscribedAt: 'desc' },
    });

    return { pages: subscriptions.map((subscription) => subscription.page) };
  }

  async unsubscribePage(user: User, pageId: number) {
    await this.assertPageExists(pageId);

    await this.prismaService.pageSubscription.deleteMany({
      where: { userId: user.id, pageId },
    });

    return { ok: true };
  }

  async getSubscriptionPagePosts(user: User, pageId: number) {
    await this.assertPageExists(pageId);

    const subscription = await this.prismaService.pageSubscription.findFirst({
      where: { userId: user.id, pageId },
    });

    if (!subscription) {
      throw new ForbiddenException('구독하지 않은 페이지입니다.');
    }

    const posts = await this.prismaService.post.findMany({
      where: { pageId },
      orderBy: { createdAt: 'desc' },
    });

    return { posts };
  }

  async assertPageExists(pageId: number) {
    const page = await this.prismaService.page.findUnique({
      where: { id: pageId },
    });

    if (!page) {
      throw new NotFoundException('페이지가 존재하지 않습니다.');
    }
  }
}
