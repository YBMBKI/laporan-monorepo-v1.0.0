import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async getSalesReport(startDate: Date, endDate: Date, filters: any) {
    const { branchId, memberId, coordinatorId, productId, statusId, wilayahKabupaten } = filters;

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(branchId && { activity: { branchId } }),
        ...(memberId && { memberId }),
        ...(productId && { productId }),
        ...(statusId && { statusId }),
      },
      include: {
        activity: { include: { branch: true, coordinator: true } },
        product: true,
        status: true,
        member: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let filteredOrders = orders;
    if (wilayahKabupaten) {
      filteredOrders = orders.filter(o => o.activity?.branch?.wilayahKabupaten === wilayahKabinsip);
    }
    if (coordinatorId) {
      filteredOrders = filteredOrders.filter(o => o.activity?.coordinatorId === coordinatorId);
    }

    const summary = {
      totalPenjualan: 0,
      totalQty: 0,
      totalDeal: 0,
      totalPending: 0,
      totalCancel: 0,
      conversionRate: 0,
    };

    for (const order of filteredOrders) {
      summary.totalPenjualan += order.totalHarga;
      summary.totalQty += order.qty;
      if (order.status.code === 'deal') summary.totalDeal++;
      else if (order.status.code === 'pending') summary.totalPending++;
      else if (order.status.code === 'cancel') summary.totalCancel++;
    }

    const totalOrders = filteredOrders.length;
    summary.conversionRate = totalOrders > 0 ? (summary.totalDeal / totalOrders) * 100 : 0;

    return { summary, orders: filteredOrders };
  }

  async getFoundationReport(month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const settings = await this.prisma.foundationSettings.findFirst();
    
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: {
        activity: { include: { branch: true } },
        product: true,
        status: true,
      },
    });

    const summary = {
      totalPenjualan: 0,
      totalDeal: 0,
      totalQty: 0,
      byBranch: {} as Record<string, any>,
      byProduct: {} as Record<string, any>,
    };

    for (const order of orders) {
      summary.totalPenjualan += order.totalHarga;
      summary.totalQty += order.qty;
      if (order.status.code === 'deal') summary.totalDeal++;

      const branchName = order.activity?.branch?.wilayahKabupaten || 'Unknown';
      if (!summary.byBranch[branchName]) {
        summary.byBranch[branchName] = { total: 0, deal: 0, qty: 0 };
      }
      summary.byBranch[branchName].total += order.totalHarga;
      if (order.status.code === 'deal') summary.byBranch[branchName].deal++;
      summary.byBranch[branchName].qty += order.qty;

      const productName = order.product.namaProduk;
      if (!summary.byProduct[productName]) {
        summary.byProduct[productName] = { total: 0, qty: 0 };
      }
      summary.byProduct[productName].total += order.totalHarga;
      summary.byProduct[productName].qty += order.qty;
    }

    return { settings, period: { month, year }, summary, orders };
  }

  async getPerformanceReport(startDate: Date, endDate: Date, filters: any) {
    const { branchId, memberId, positionId } = filters;

    const members = await this.prisma.member.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(memberId && { id: memberId }),
      },
      include: {
        branch: true,
        position: true,
        orders: {
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
          include: { status: true },
        },
      },
    });

    const performance = members.map(member => {
      const dealOrders = member.orders.filter(o => o.status.code === 'deal');
      const totalDeal = dealOrders.length;
      const totalQtyDeal = dealOrders.reduce((sum, o) => sum + o.qty, 0);
      const totalSalesAmount = dealOrders.reduce((sum, o) => sum + o.totalHarga, 0);

      return {
        memberId: member.id,
        kodeAnggota: member.kodeAnggota,
        namaAnggota: member.namaAnggota,
        branch: member.branch.wilayahKabupaten,
        totalActivities: member.activityMembers?.length || 0,
        totalDeal,
        totalQtyDeal,
        totalSalesAmount,
      };
    });

    return performance.sort((a, b) => b.totalSalesAmount - a.totalSalesAmount);
  }

  async exportSalesXlsx(startDate: Date, endDate: Date, filters: any) {
    const { orders } = await this.getSalesReport(startDate, endDate, filters);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');

    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 12 },
      { header: 'Nama Kegiatan', key: 'nama_kegiatann', width: 25 },
      { header: 'Wilayah', key: 'wilayah', width: 15 },
      { header: 'Nama Anggota', key: 'nama_anggota', width: 20 },
      { header: 'Produk', key: 'nama_produk', width: 20 },
      { header: 'Qty', key: 'qty', width: 8 },
      { header: 'Harga', key: 'harga_satuan', width: 12 },
      { header: 'Total', key: 'total_harga', width: 15 },
      { header: 'Status', key: 'status', width: 12 },
    ];

    for (const order of orders) {
      worksheet.addRow({
        tanggal: order.createdAt,
        nama_kegiatann: order.activity?.nama_kegiatann || '',
        wilayah: order.activity?.branch?.wilayahKabupaten || '',
        nama_anggota: order.member?.namaAnggota || '',
        nama_produk: order.product.namaProduk,
        qty: order.qty,
        harga_satuan: order.hargaSatuan,
        total_harga: order.totalHarga,
        status: order.status.name,
      });
    }

    return workbook;
  }
}
