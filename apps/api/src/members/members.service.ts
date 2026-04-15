import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';

@Injectable()
export class MembersService {
  constructor(private prisma: PrismaService) {}

  async create(createMemberDto: CreateMemberDto) {
    const existing = await this.prisma.member.findUnique({
      where: { kodeAnggota: createMemberDto.kodeAnggota },
    });
    if (existing) {
      throw new ConflictException('Member code already exists');
    }
    return this.prisma.member.create({
      data: createMemberDto,
      include: { branch: true, position: true },
    });
  }

  async findAll(branchId?: string, positionId?: string, statusAktif?: boolean) {
    return this.prisma.member.findMany({
      where: {
        ...(branchId && { branchId }),
        ...(positionId && { positionId }),
        ...(statusAktif !== undefined && { statusAktif }),
      },
      include: { branch: true, position: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: { branch: true, position: true, user: true },
    });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async findByKode(kodeAnggota: string) {
    return this.prisma.member.findUnique({
      where: { kodeAnggota },
    });
  }

  async update(id: string, updateMemberDto: UpdateMemberDto) {
    await this.findById(id);
    return this.prisma.member.update({
      where: { id },
      data: updateMemberDto,
      include: { branch: true, position: true },
    });
  }

  async remove(id: string) {
    await this.findById(id);
    return this.prisma.member.delete({ where: { id } });
  }

  async toggleActive(id: string) {
    const member = await this.findById(id);
    return this.prisma.member.update({
      where: { id },
      data: { statusAktif: !member.statusAktif },
    });
  }
}
