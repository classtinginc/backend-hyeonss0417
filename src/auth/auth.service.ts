import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma.service';
import { type GenerateToken } from './dto/generate-token.dto';

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

    const payload = { sub: user!.id };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }
}
