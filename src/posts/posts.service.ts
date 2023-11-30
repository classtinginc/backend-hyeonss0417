import { HttpException, Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma.service';
import { type CreatePostDto } from './dto/create-post.dto';
import { type UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    const { pageId, title, content } = createPostDto;

    const post = await this.prismaService.post.create({
      data: {
        title,
        content,
        pageId,
      },
    });

    return { post };
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    const { title, content } = updatePostDto;

    const post = await this.prismaService.post.update({
      where: { id },
      data: { title, content },
    });

    return { post };
  }

  async remove(id: number) {
    return this.prismaService.post.delete({ where: { id } });
  }

  async assertPermission(userId: number, pageId: number) {
    const user = await this.prismaService.pageOwnership.findFirst({
      where: { userId, pageId },
    });

    if (!user) {
      throw new HttpException('권한이 없습니다.', 403);
    }
  }
}
