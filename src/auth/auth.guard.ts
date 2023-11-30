import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma.service';
import { type TypedReq } from '../types/express';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';
import { type TokenPayload } from './types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<TypedReq>();
    const token = this.getTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    const userId = this.getUserIdFromToken(token);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;

    return true;
  }

  private getTokenFromRequest(request: TypedReq): string | undefined {
    const authorization = request.headers.authorization || '';
    const [type, token] = authorization.split(' ');

    return type === 'Bearer' ? token : undefined;
  }

  private getUserIdFromToken(token: string): number {
    try {
      const { sub } = this.jwtService.verify<TokenPayload>(token);

      return sub;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
