import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateFoundationSettingsDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getFoundationSettings() {
    return this.prisma.foundationSettings.findFirst();
  }

  async createOrUpdateFoundationSettings(dto: CreateFoundationSettingsDto) {
    const existing = await this.prisma.foundationSettings.findFirst();
    if (existing) {
      return this.prisma.foundationSettings.update({
        where: { id: existing.id },
        data: dto,
      });
    }
    return this.prisma.foundationSettings.create({ data: dto });
  }

  async getOrderStatuses() {
    return this.prisma.orderStatus.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createOrderStatus(data: any) {
    return this.prisma.orderStatus.create({ data });
  }

  async getGolongans() {
    return this.prisma.golongan.findMany();
  }

  async createGolongan(data: any) {
    return this.prisma.golongan.create({ data });
  }

  async getActivityPositions() {
    return this.prisma.activityPosition.findMany({
      where: { isActive: true },
    });
  }

  async createActivityPosition(data: any) {
    return this.prisma.activityPosition.create({ data });
  }

  async getMemberPositions() {
    return this.prisma.memberPosition.findMany();
  }

  async createMemberPosition(data: any) {
    return this.prisma.memberPosition.create({ data });
  }
}
