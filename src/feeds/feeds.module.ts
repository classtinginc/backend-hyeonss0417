import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { FeedsController } from './feeds.controller';
import { FeedsService } from './feeds.service';

@Module({
  controllers: [FeedsController],
  providers: [FeedsService, PrismaService],
})
export class FeedsModule {}
