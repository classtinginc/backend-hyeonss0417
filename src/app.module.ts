import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';

import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { FeedsModule } from './feeds/feeds.module';
import { PagesModule } from './pages/pages.module';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma.service';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { ValidatorExceptionFilter } from './validator.exception';

@Module({
  imports: [
    AuthModule,
    PagesModule,
    PostsModule,
    SubscriptionsModule,
    FeedsModule,
  ],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ValidatorExceptionFilter,
    },
  ],
})
export class AppModule {}
