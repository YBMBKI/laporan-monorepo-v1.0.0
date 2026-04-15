import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log(userId: string, action: string, entity: string, entityId?: string, oldValue?: any, newValue?: any, ipAddress?: string, userAgent?: string) {
    return this.prisma.auditLog.create({
      data: { userId, action, entity, entityId, oldValue, newValue, ipAddress, userAgent },
    });
  }

  async findAll(userId?: string, action?: string, entity?: string, startDate?: Date, endDate?: Date) {
    return this.prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(action && { action }),
        ...(entity && { entity }),
        ...(startDate && endDate && { createdAt: { gte: startDate, lte: endDate } }),
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });
  }
}
