import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export interface MemberPayrollData {
  memberId: string;
  totalDealCount: number;
  totalQtyDeal: number;
  totalSalesAmount: number;
  incentiveByPosition: Record<string, number>;
  incentiveAmount: number;
}

@Injectable()
export class PayrollService {
  constructor(private prisma: PrismaService) {}

  async getPayrollRules() {
    return this.prisma.payrollRule.findMany({ where: { isActive: true } });
  }

  async createPayrollRule(data: any) {
    return this.prisma.payrollRule.create({ data });
  }

  async updatePayrollRule(id: string, data: any) {
    await this.findPayrollRuleById(id);
    return this.prisma.payrollRule.update({ where: { id }, data });
  }

  async findPayrollRuleById(id: string) {
    const rule = await this.prisma.payrollRule.findUnique({ where: { id } });
    if (!rule) throw new NotFoundException('Payroll rule not found');
    return rule;
  }

  async calculateMemberPayroll(memberId: string, startDate: Date, endDate: Date): Promise<MemberPayrollData> {
    const member = await this.prisma.member.findUnique({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const orders = await this.prisma.order.findMany({
      where: {
        memberId,
        dealAt: { gte: startDate, lte: endDate },
        status: { isDeal: true },
      },
      include: { activity: { include: { activityMembers: { where: { memberId } } } } },
    });

    const activityPositions = await this.prisma.activityPosition.findMany({ where: { isActive: true } });
    const payrollRules = await this.prisma.payrollRule.findMany({ 
      where: { isActive: true },
      include: { activityPosition: true },
    });

    const incentiveByPosition: Record<string, number> = {};
    let totalDealCount = 0;
    let totalQtyDeal = 0;
    let totalSalesAmount = 0;
    let incentiveAmount = 0;

    for (const order of orders) {
      totalSalesAmount += order.totalHarga;
      totalQtyDeal += order.qty;
      totalDealCount++;

      const activityMember = order.activity?.activityMembers?.find(am => am.memberId === memberId);
      if (activityMember) {
        const positionCode = activityMember.activityPosition?.code || 'pribadi';
        const rule = payrollRules.find(r => r.activityPositionId === activityMember.activityPositionId);
        const incentive = rule?.amountValue || this.getDefaultIncentive(positionCode);
        const positionTotal = incentive * order.qty;
        
        incentiveByPosition[positionCode] = (incentiveByPosition[positionCode] || 0) + positionTotal;
        incentiveAmount += positionTotal;
      }
    }

    return {
      memberId,
      totalDealCount,
      totalQtyDeal,
      totalSalesAmount,
      incentiveByPosition,
      incentiveAmount,
    };
  }

  private getDefaultIncentive(positionCode: string): number {
    const defaults: Record<string, number> = {
      konsultan: 100000,
      surveyor: 50000,
      pribadi: 150000,
    };
    return defaults[positionCode] || 0;
  }

  async generatePayrollPeriod(periodName: string, month: number, year: number, startDate: Date, endDate: Date, userId: string) {
    const period = await this.prisma.payrollPeriod.create({
      data: {
        periodName,
        month,
        year,
        startDate,
        endDate,
        status: 'draft',
        generatedBy: userId,
        generatedAt: new Date(),
      },
    });

    const members = await this.prisma.member.findMany({ where: { statusAktif: true } });
    const payrollResults: any[] = [];

    for (const member of members) {
      const payrollData = await this.calculateMemberPayroll(member.id, startDate, endDate);
      
      await this.prisma.memberPayroll.create({
        data: {
          payrollPeriodId: period.id,
          memberId: member.id,
          totalDealCount: payrollData.totalDealCount,
          totalQtyDeal: payrollData.totalQtyDeal,
          totalSalesAmount: payrollData.totalSalesAmount,
          incentiveAmount: payrollData.incentiveAmount,
          finalAmount: payrollData.incentiveAmount,
        },
      });
      
      payrollResults.push(payrollData);
    }

    await this.prisma.payrollPeriod.update({
      where: { id: period.id },
      data: { status: 'generated' },
    });

    return { period, results: payrollResults };
  }

  async getPayrollPeriods() {
    return this.prisma.payrollPeriod.findMany({
      orderBy: { year: 'desc', month: 'desc' },
    });
  }

  async getPayrollPeriodById(id: string) {
    const period = await this.prisma.payrollPeriod.findUnique({
      where: { id },
      include: { memberPayrolls: { include: { member: true } } },
    });
    if (!period) throw new NotFoundException('Payroll period not found');
    return period;
  }

  async getMemberPayrolls(memberId: string) {
    return this.prisma.memberPayroll.findMany({
      where: { memberId },
      include: { payrollPeriod: true },
      orderBy: { generatedAt: 'desc' },
    });
  }
}
