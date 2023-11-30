import { Module } from '@nestjs/common';

import { FeedsService } from '../feeds/feeds.service';
import { PrismaService } from '../prisma.service';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService, FeedsService],
})
export class PostsModule {}
