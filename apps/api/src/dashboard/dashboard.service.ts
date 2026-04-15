import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const [
      todayOrders,
      monthOrders,
      totalMembers,
      activeMembers,
      totalBranches,
      pendingImports,
      dealOrders,
    ] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
      this.prisma.order.count({ where: { createdAt: { gte: startOfMonth, lte: endOfMonth } } }),
      this.prisma.member.count(),
      this.prisma.member.count({ where: { statusAktif: true } }),
      this.prisma.branch.count({ where: { isActive: true } }),
      this.prisma.import.count({ where: { status: 'draft' } }),
      this.prisma.order.count({ 
        where: { 
          createdAt: { gte: startOfMonth, lte: endOfMonth },
          status: { isDeal: true },
        } 
      }),
    ]);

    const totalPenjualanHariIni = await this.prisma.order.aggregate({
      where: { createdAt: { gte: today, lt: tomorrow } },
      _sum: { totalHarga: true },
    });

    const totalPenjualanBulanIni = await this.prisma.order.aggregate({
      where: { createdAt: { gte: startOfMonth, lte: endOfMonth } },
      _sum: { totalHarga: true },
    });

    const topPerformers = await this.prisma.order.findMany({
      where: { 
        createdAt: { gte: startOfMonth, lte: endOfMonth },
        status: { isDeal: true },
      },
      include: { member: true },
    });

    const performerMap = new Map<string, { memberId: string; namaAnggota: string; totalSales: number; dealCount: number }>();
    for (const order of topPerformers) {
      if (!order.memberId || !order.member) continue;
      const existing = performerMap.get(order.memberId);
      if (existing) {
        existing.totalSales += order.totalHarga;
        existing.dealCount++;
      } else {
        performerMap.set(order.memberId, {
          memberId: order.memberId,
          namaAnggota: order.member.namaAnggota,
          totalSales: order.totalHarga,
          dealCount: 1,
        });
      }
    }

    const top5 = Array.from(performerMap.values())
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);

    return {
      today: {
        totalOrders: todayOrders,
        totalPenjualan: totalPenjualanHariIni._sum.totalHarga || 0,
      },
      month: {
        totalOrders: monthOrders,
        totalPenjualan: totalPenjualanBulanIni._sum.totalHarga || 0,
        totalDeal: dealOrders,
      },
      totals: {
        totalMembers,
        activeMembers,
        totalBranches,
        pendingImports,
      },
      topPerformers: top5,
    };
  }

  async getSalesTrend(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { status: true },
    });

    const dailyMap = new Map<string, { date: string; penjualan: number; deal: number; qty: number }>();
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dailyMap.set(dateKey, { date: dateKey, penjualan: 0, deal: 0, qty: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const order of orders) {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(dateKey);
      if (existing) {
        existing.penjualan += order.totalHarga;
        existing.qty += order.qty;
        if (order.status.isDeal) existing.deal++;
      }
    }

    return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getStatusDistribution(startDate: Date, endDate: Date) {
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { status: true },
    });

    const distribution: Record<string, { count: number; total: number }> = {};
    for (const order of orders) {
      const statusName = order.status.name;
      if (!distribution[statusName]) {
        distribution[statusName] = { count: 0, total: 0 };
      }
      distribution[statusName].count++;
      distribution[statusName].total += order.totalHarga;
    }

    return distribution;
  }
}
