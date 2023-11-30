import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { type SignUp, type TokenPayload } from '../auth/types';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signUp(body: SignUp) {
    const { email, isAdmin } = body;

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { isAdmin },
      create: { email, isAdmin },
    });
    const payload: TokenPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(payload);

    return { user, accessToken };
  }
}
