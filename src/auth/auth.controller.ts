import { Controller, HttpCode, Post, Request } from '@nestjs/common';
import { type Tspec } from 'tspec';

import { TypedReq } from '../types/express';
import { type Operation } from '../types/openapi';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { type SignUp } from './types';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(200)
  login(@Request() req: TypedReq<{ body: SignUp }>) {
    return this.authService.signUp(req.body);
  }
}

export type AuthApiSpec = Tspec.DefineApiSpec<{
  tags: ['Auth'];
  paths: {
    '/auth/signup': {
      post: Operation<'토큰 발급', AuthController, 'login'>;
    };
  };
}>;
