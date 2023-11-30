import { Body, Controller, Get, HttpCode, Post, Request } from '@nestjs/common';
import { Express } from 'express';
import { type Tspec } from 'tspec';

import { type ResponseType } from '../types/schema';
import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';

@Controller('pages')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Post()
  @HttpCode(201)
  create(
    @Request() req: Express.Request,
    @Body() createPageDto: CreatePageDto,
  ) {
    return this.pagesService.create(req.user, createPageDto);
  }

  @Get()
  findAll() {
    return this.pagesService.findAll();
  }
}

export type PageApiSpec = Tspec.DefineApiSpec<{
  tags: ['Pages'];
  basePath: '/pages';
  security: 'jwt';
  paths: {
    '/': {
      post: {
        body: CreatePageDto;
        responses: {
          201: ResponseType<PagesController, 'create'>;
        };
      };
      get: {
        responses: {
          200: ResponseType<PagesController, 'findAll'>;
        };
      };
    };
  };
}>;
