import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateActivityDto, UpdateActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async create(createActivityDto: CreateActivityDto, userId: string) {
    return this.prisma.activity.create({
      data: {
        ...createActivityDto,
        createdBy: userId,
      },
      include: {
        branch: true,
        coordinator: true,
        activityMembers: { include: { member: true, activityPosition: true } },
      },
    });
  }

  async findAll(branchId?: string, coordinatorId?: string, startDate?: Date, endDate?: Date) {
    return this.prisma.activity.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(coordinatorId && { coordinatorId }),
        ...(startDate && endDate && {
          tanggal_kegiatann: { gte: startDate, lte: endDate },
        }),
      },
      include: {
        branch: true,
        coordinator: true,
        activityMembers: { include: { member: true, activityPosition: true } },
        orders: { include: { product: true, status: true } },
      },
      orderBy: { tanggal_kegiatann: 'desc' },
    });
  }

  async findById(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
      include: {
        branch: true,
        coordinator: true,
        activityMembers: { include: { member: true, activityPosition: true } },
        orders: { include: { product: true, status: true, member: true } },
      },
    });
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto) {
    await this.findById(id);
    return this.prisma.activity.update({
      where: { id },
      data: updateActivityDto,
      include: {
        branch: true,
        coordinator: true,
        activityMembers: { include: { member: true, activityPosition: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.activity.delete({ where: { id } });
  }

  async addMember(activityId: string, memberId: string, activityPositionId: string, notes?: string) {
    await this.findById(activityId);
    return this.prisma.activityMember.create({
      data: { activityId, memberId, activityPositionId, notes },
      include: { member: true, activityPosition: true },
    });
  }

  async removeMember(activityId: string, memberId: string) {
    await this.findById(activityId);
    return this.prisma.activityMember.delete({
      where: {
        activityId_memberId: { activityId, memberId },
      },
    });
  }
}
