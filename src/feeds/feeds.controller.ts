import { Controller, Get, Request } from '@nestjs/common';
import { type Tspec } from 'tspec';

import { TypedReq } from '../types/express';
import { type Operation } from '../types/openapi';
import { FeedsService } from './feeds.service';

@Controller('feeds')
export class FeedsController {
  constructor(private readonly feedsService: FeedsService) {}

  @Get()
  getFeed(@Request() req: TypedReq) {
    const { user } = req;

    return this.feedsService.getFeed(user);
  }
}

export type FeedApiSpec = Tspec.DefineApiSpec<{
  tags: ['Feeds'];
  security: 'jwt';
  paths: {
    '/feeds': {
      get: Operation<'피드 조회', FeedsController['getFeed']>;
    };
  };
}>;
