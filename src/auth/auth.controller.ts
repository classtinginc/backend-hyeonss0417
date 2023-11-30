import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { AuthService } from './auth.service';
import { GenerateToken } from './dto/generate-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(200)
  @Post('token')
  login(@Body() body: GenerateToken) {
    return this.authService.generateToken(body);
  }
}
