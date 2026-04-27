import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audits/audit.service';
import { LoginDto } from './dto/login.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { verifyPassword } from './password';
import { signToken } from './token';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { memberships: { include: { business: true } } },
    });
    if (!user || !verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      token: signToken({ sub: user.id, email: user.email }),
      user: this.serializeUser(user),
      businessId: user.memberships[0]?.businessId,
    };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { memberships: { include: { business: true } } },
    });
    return this.serializeUser(user);
  }

  async createBusiness(userId: string, dto: CreateBusinessDto) {
    const business = await this.prisma.business.create({
      data: {
        name: dto.name,
        industry: dto.industry,
        memberships: { create: { userId, role: 'Owner' } },
      },
    });
    await this.audit.log({
      actorUserId: userId,
      businessId: business.id,
      model: 'Business',
      modelId: business.id,
      action: 'CREATE',
      description: `Created business ${business.name}`,
      changes: dto,
    });
    return business;
  }

  private serializeUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      businesses: user.memberships.map((membership: any) => ({
        id: membership.business.id,
        name: membership.business.name,
        industry: membership.business.industry,
        role: membership.role,
      })),
    };
  }
}
