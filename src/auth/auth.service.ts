import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma.service';
import { type GenerateToken } from './dto/generate-token.dto';
import { type TokenPayload } from './dto/token-payload';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async generateToken(body: GenerateToken) {
    const { email } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new HttpException('User not found', 404);
    }

    const payload: TokenPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
