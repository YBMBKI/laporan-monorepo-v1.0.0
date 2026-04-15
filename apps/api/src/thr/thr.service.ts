import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class ThrService {
  constructor(private prisma: PrismaService) {}

  async getThrRules() {
    return this.prisma.thrRule.findMany({ where: { isActive: true } });
  }

  async createThrRule(data: any) {
    return this.prisma.thrRule.create({ data });
  }

  async updateThrRule(id: string, data: any) {
    await this.findThrRuleById(id);
    return this.prisma.thrRule.update({ where: { id }, data });
  }

  async findThrRuleById(id: string) {
    const rule = await this.prisma.thrRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('THR rule not found');
    return rule;
  }

  async calculateMemberThr(
    memberId: string,
    startDate: Date,
    endDate: Date,
    pointPerQty: number = 1,
    rupiahPerPoint: number = 1000,
  ): Promise<{ totalQtyDeal: number; totalPoints: number; thrAmount: number }> {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const orders = await this.prisma.order.findMany({
      where: {
        memberId,
        dealAt: { gte: startDate, lte: endDate },
        status: { isDeal: true },
      },
    });

    let totalQtyDeal = 0;
    for (const order of orders) {
      totalQtyDeal += order.qty;
    }

    const totalPoints = totalQtyDeal * pointPerQty;
    const thrAmount = totalPoints * rupiahPerPoint;

    return { totalQtyDeal, totalPoints, thrAmount };
  }

  async calculateAllMemberThr(
    startDate: Date,
    endDate: Date,
    pointPerQty: number = 1,
    rupiahPerPoint: number = 1000,
  ) {
    const members = await this.prisma.member.findMany({ where: { statusAktif: true } });
    const results = [];

    for (const member of members) {
      const thrData = await this.calculateMemberThr(member.id, startDate, endDate, pointPerQty, rupiahPerPoint);
      results.push({
        memberId: member.id,
        kodeAnggota: member.kodeAnggota,
        namaAnggota: member.namaAnggota,
        ...thrData,
      });
    }

    return results.sort((a, b) => b.thrAmount - a.thrAmount);
  }
}
