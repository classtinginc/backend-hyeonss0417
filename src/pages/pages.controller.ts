import { Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { type Tspec } from 'tspec';

import { TypedReq } from '../types/express';
import {
  type BadRequestError,
  type ForbiddenError,
  type Operation,
} from '../types/openapi';
import { PagesService } from './pages.service';
import { type CreatePageDto } from './types';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(201)
  create(@Request() req: TypedReq<{ body: CreatePageDto }>) {
    const { user, body } = req;

    return this.pagesService.create(user, body);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }
}

export type PageApiSpec = Tspec.DefineApiSpec<{
  tags: ['Pages'];
  security: 'jwt';
  paths: {
    '/pages': {
      post: Operation<
        '학교 페이지 생성',
        PagesController['create'],
        201,
        BadRequestError | ForbiddenError
      >;
      get: Operation<'학교 페이지 목록 조회', PagesController['findAll']>;
    };
  };
}>;
