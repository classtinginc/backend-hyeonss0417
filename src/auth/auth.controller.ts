import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { type Tspec } from 'tspec';

import { type ResponseType } from '../types/schema';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GenerateToken } from './dto/generate-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(200)
  @Post('token')
  login(@Body() body: GenerateToken) {
    return this.authService.generateToken(body);
  }
}

export type AuthApiSpec = Tspec.DefineApiSpec<{
  tags: ['Auth'];
  basePath: '/auth';
  paths: {
    '/token': {
      post: {
        body: GenerateToken;
        responses: {
          200: ResponseType<AuthController, 'login'>;
        };
      };
    };
  };
}>;
