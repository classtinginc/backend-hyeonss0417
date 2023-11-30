import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Request,
} from '@nestjs/common';
import { type Tspec } from 'tspec';

import { TypedReq } from '../types/express';
import { type Operation } from '../types/openapi';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post('pages/:pageId')
  @HttpCode(201)
  subscribe(@Request() req: TypedReq<{ params: { pageId: number } }>) {
    const { user, params } = req;

    return this.subscriptionsService.subscribePage(user, params.pageId);
  }

  @Get('pages')
  listPages(@Request() req: TypedReq) {
    const { user } = req;

    return this.subscriptionsService.getSubscriptionPages(user);
  }

  @Delete('pages/:pageId')
  @HttpCode(204)
  unsubscribe(@Request() req: TypedReq<{ params: { pageId: number } }>) {
    const { user, params } = req;

    return this.subscriptionsService.unsubscribePage(user, params.pageId);
  }

  @Get('pages/:pageId/posts')
  listPosts(@Request() req: TypedReq<{ params: { pageId: number } }>) {
    const { user, params } = req;

    return this.subscriptionsService.getSubscriptionPagePosts(
      user,
      params.pageId,
    );
  }
}

export type SubscriptionApiSpec = Tspec.DefineApiSpec<{
  tags: ['Subscriptions'];
  security: 'jwt';
  paths: {
    '/subscriptions/pages': {
      get: Operation<
        '구독중인 학교 페이지 목록 조회',
        SubscriptionsController,
        'listPages'
      >;
    };
    '/subscriptions/pages/{pageId}': {
      post: Operation<
        '학교 페이지 구독',
        SubscriptionsController,
        'subscribe',
        201
      >;
      delete: Operation<
        '학교 페이지 구독 취소',
        SubscriptionsController,
        'unsubscribe'
      >;
    };
    '/subscriptions/pages/{pageId}/posts': {
      get: Operation<
        '구독중인 학교 페이지별 소식 조회',
        SubscriptionsController,
        'listPosts'
      >;
    };
  };
}>;
