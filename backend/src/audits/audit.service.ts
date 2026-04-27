import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type AuditInput = {
  businessId?: string;
  actorUserId?: string;
  model: string;
  modelId?: string;
  action: string;
  description: string;
  changes?: unknown;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: AuditInput) {
    return this.prisma.auditLog.create({
      data: {
        businessId: input.businessId,
        actorUserId: input.actorUserId,
        model: input.model,
        modelId: input.modelId,
        action: input.action,
        description: input.description,
        changes: JSON.stringify(input.changes ?? {}),
      },
    });
  }

  async findAll(businessId: string) {
    const logs = await this.prisma.auditLog.findMany({
      where: { businessId },
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return logs.map((log) => ({
      ...log,
      changes: JSON.parse(log.changes || '{}'),
      actor: log.actor ? { id: log.actor.id, name: log.actor.name, email: log.actor.email } : null,
    }));
  }
}
