import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { Express } from 'express';
import { type Tspec } from 'tspec';

import { type ResponseType } from '../types/schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(201)
  async create(
    @Request() req: Express.Request,
    @Body() createPostDto: CreatePostDto,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.postsService.assertPermission(req.user.id, createPostDto.pageId);

    return this.postsService.create(createPostDto);
  }

  @Patch(':id')
  async update(
    @Request() req: Express.Request,
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    await this.postsService.assertPermission(req.user.id, Number(id));

    return this.postsService.update(Number(id), updatePostDto);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req: Express.Request, @Param('id') id: string) {
    await this.postsService.assertPermission(req.user.id, Number(id));

    return this.postsService.remove(Number(id));
  }
}

export type PostApiSpec = Tspec.DefineApiSpec<{
  tags: ['Posts'];
  basePath: '/posts';
  security: 'jwt';
  paths: {
    '/': {
      post: {
        body: CreatePostDto;
        responses: {
          201: ResponseType<PostsController, 'create'>;
        };
      };
    };
    '/{id}': {
      patch: {
        path: { id: number };
        body: UpdatePostDto;
        responses: {
          200: ResponseType<PostsController, 'update'>;
        };
      };
      delete: {
        path: { id: number };
        responses: {
          204: ResponseType<PostsController, 'remove'>;
        };
      };
    };
  };
}>;
