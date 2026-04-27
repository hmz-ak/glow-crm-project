import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';
import { verifyToken } from './token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const header = request.headers.authorization as string | undefined;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
    if (!token) {
      throw new UnauthorizedException('Missing auth token');
    }

    try {
      const payload = verifyToken(token);
      const memberships = await this.prisma.businessMember.findMany({
        where: { userId: payload.sub },
        include: { business: true },
        orderBy: { createdAt: 'asc' },
      });
      const requestedBusinessId = request.headers['x-business-id'] as string | undefined;
      const membership =
        memberships.find((item) => item.businessId === requestedBusinessId) ?? memberships[0];
      if (!membership) {
        throw new UnauthorizedException('No business access');
      }
      request.user = {
        id: payload.sub,
        email: payload.email,
        businesses: memberships.map((item) => ({
          id: item.business.id,
          name: item.business.name,
          industry: item.business.industry,
          role: item.role,
        })),
      };
      request.businessId = membership.businessId;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid auth token');
    }
  }
}
