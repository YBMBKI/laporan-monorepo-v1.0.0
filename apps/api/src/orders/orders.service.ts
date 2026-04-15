import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateOrderDto, UpdateOrderDto } from './dto/order.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    const totalHarga = createOrderDto.qty * createOrderDto.hargaSatuan;
    return this.prisma.order.create({
      data: {
        ...createOrderDto,
        totalHarga,
        ...(createOrderDto.statusId === 'deal' && { dealAt: new Date() }),
      },
      include: { product: true, status: true, member: true, activity: true },
    });
  }

  async findAll(
    activityId?: string,
    memberId?: string,
    statusId?: string,
    productId?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    return this.prisma.order.findMany({
      where: {
        ...(activityId && { activityId }),
        ...(memberId && { memberId }),
        ...(statusId && { statusId }),
        ...(productId && { productId }),
        ...(startDate && endDate && {
          createdAt: { gte: startDate, lte: endDate },
        }),
      },
      include: { product: true, status: true, member: true, activity: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { product: true, status: true, member: true, activity: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    await this.findById(id);
    const data = { ...updateOrderDto };
    if (updateOrderDto.qty !== undefined && updateOrderDto.hargaSatuan !== undefined) {
      data.totalHarga = updateOrderDto.qty * updateOrderDto.hargaSatuan;
    }
    if (updateOrderDto.statusId === 'deal') {
      data.dealAt = new Date();
    }
    return this.prisma.order.update({
      where: { id },
      data,
      include: { product: true, status: true, member: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.order.delete({ where: { id } });
  }

  async getSalesSummary(startDate: Date, endDate: Date, branchId?: string, statusId?: string) {
    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        ...(branchId && { activity: { branchId } }),
        ...(statusId && { statusId }),
      },
      include: { activity: { include: { branch: true } }, product: true, status: true },
    });

    const summary = {
      totalPenjualan: 0,
      totalQty: 0,
      totalDeal: 0,
      totalPending: 0,
      totalCancel: 0,
      byStatus: {} as Record<string, number>,
      byProduct: {} as Record<string, number>,
      byBranch: {} as Record<string, number>,
    };

    for (const order of orders) {
      const statusCode = order.status.code;
      summary.totalPenjualan += order.totalHarga;
      summary.totalQty += order.qty;
      if (statusCode === 'deal') {
        summary.totalDeal++;
        summary.byStatus['deal'] = (summary.byStatus['deal'] || 0) + order.totalHarga;
      } else if (statusCode === 'pending') {
        summary.totalPending++;
        summary.byStatus['pending'] = (summary.byStatus['pending'] || 0) + order.totalHarga;
      } else if (statusCode === 'cancel') {
        summary.totalCancel++;
        summary.byStatus['cancel'] = (summary.byStatus['cancel'] || 0) + order.totalHarga;
      }
      const productName = order.product.namaProduk;
      summary.byProduct[productName] = (summary.byProduct[productName] || 0) + order.totalHarga;
      const branchName = order.activity?.branch?.wilayahKabupaten || 'Unknown';
      summary.byBranch[branchName] = (summary.byBranch[branchName] || 0) + order.totalHarga;
    }

    return summary;
  }
}
