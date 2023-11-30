import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}