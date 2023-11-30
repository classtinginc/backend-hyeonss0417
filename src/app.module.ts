import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { PagesModule } from './pages/pages.module';
import { PostsModule } from './posts/posts.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule, PagesModule, PostsModule],
  controllers: [AppController],
  providers: [
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
