import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { kodeProduk: createProductDto.kodeProduk },
    });
    if (existing) {
      throw new ConflictException('Product code already exists');
    }
    return this.prisma.product.create({ data: createProductDto });
  }

  async findAll(kategori?: string, isActive?: boolean) {
    return this.prisma.product.findMany({
      where: {
        ...(kategori && { kategori }),
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async findByKode(kodeProduk: string) {
    return this.prisma.product.findUnique({ where: { kodeProduk } });
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    await this.findById(id);
    return this.prisma.product.update({ where: { id }, data: updateProductDto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
