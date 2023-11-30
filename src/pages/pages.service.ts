import { HttpException, Injectable } from '@nestjs/common';
import { type User } from '@prisma/client';

import { PrismaService } from '../prisma.service';
import { type CreatePageDto } from './types';

@Injectable()
export class PagesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(user: User, createPageDto: CreatePageDto) {
    if (!user.isAdmin) {
      throw new HttpException('관리자만 페이지를 생성할 수 있습니다.', 403);
    }

    const { location, schoolName } = createPageDto;

    const exist = await this.prismaService.page.findFirst({
      where: { location, schoolName },
    });

    if (exist) {
      throw new HttpException('이미 같은 학교의 페이지가 존재합니다.', 400);
    }

    const page = await this.prismaService.$transaction(async (prisma) => {
      const pageInner = await prisma.page.create({
        data: { location, schoolName },
      });

      await prisma.pageOwnership.create({
        data: {
          user: { connect: { id: user.id } },
          page: { connect: { id: pageInner.id } },
        },
      });

      return pageInner;
    });

    return { page };
  }

  async findAll() {
    const pages = await this.prismaService.page.findMany();

    return { pages };
  }
}
