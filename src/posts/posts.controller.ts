import {
  Controller,
  Delete,
  HttpCode,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { type Tspec } from 'tspec';

import { TypedReq } from '../types/express';
import { type Operation } from '../types/openapi';
import { PostsService } from './posts.service';
import { type CreatePost, type UpdatePost } from './types';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(201)
  async publish(@Request() req: TypedReq<{ body: CreatePost }>) {
    const { user, body } = req;
    await this.postsService.assertPermissionByPageId(user.id, body.pageId);

    return this.postsService.publish(body);
  }

  @Patch(':id')
  async update(
    @Request() req: TypedReq<{ params: { id: number }; body: UpdatePost }>,
  ) {
    const { user, params, body } = req;
    await this.postsService.assertPermissionByPostId(user.id, params.id);

    return this.postsService.update(params.id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Request() req: TypedReq<{ params: { id: number } }>) {
    const { user, params } = req;
    await this.postsService.assertPermissionByPostId(user.id, params.id);

    return this.postsService.remove(params.id);
  }
}

export type PostApiSpec = Tspec.DefineApiSpec<{
  tags: ['Posts'];
  security: 'jwt';
  paths: {
    '/posts': {
      post: Operation<'학교 소식 발행', PostsController, 'publish', 201>;
    };
    '/posts/{id}': {
      patch: Operation<'학교 소식 수정', PostsController, 'update'>;
      delete: Operation<'학교 소식 삭제', PostsController, 'remove', 204>;
    };
  };
}>;
