import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateBranchDto, UpdateBranchDto } from './dto/branch.dto';

@Injectable()
export class BranchesService {
  constructor(private prisma: PrismaService) {}

  async create(createBranchDto: CreateBranchDto) {
    const existing = await this.prisma.branch.findUnique({
      where: { kodeCabang: createBranchDto.kodeCabang },
    });
    if (existing) {
      throw new ConflictException('Branch code already exists');
    }
    return this.prisma.branch.create({ data: createBranchDto });
  }

  async findAll(wilayahKabupaten?: string, wilayahProvinsi?: string, isActive?: boolean) {
    return this.prisma.branch.findMany({
      where: {
        ...(wilayahKabupaten && { wilayahKabupaten }),
        ...(wilayahProvinsi && { wilayahProvinsi }),
        ...(isActive !== undefined && { isActive }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const branch = await this.prisma.branch.findUnique({ where: { id } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }

  async update(id: string, updateBranchDto: UpdateBranchDto) {
    await this.findById(id);
    return this.prisma.branch.update({ where: { id }, data: updateBranchDto });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.branch.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const branch = await this.findById(id);
    return this.prisma.branch.update({ where: { id }, data: { isActive: !branch.isActive } });
  }
}
