import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as ExcelJS from 'exceljs';

export interface ImportRowData {
  rowNumber: number;
  tanggal_kegiatann: string;
  nama_kegiatann: string;
  wilayah_kelompok: string;
  wilayah_kabupaten: string;
  wilayah_provinsi: string;
  nama_koordinator: string;
  nama_anggota: string;
  jabatan_kegiatann: string;
  nama_produk: string;
  qty: number;
  harga_satuan: number;
  golongan: string;
  status_order: string;
  keterangan: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async upload(file: Express.Multer.File, userId: string) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file.buffer);
    
    const worksheet = workbook.getWorksheet('LAPORAN_KEGIATAN');
    if (!worksheet) {
      throw new BadRequestException('Sheet LAPORAN_KEGIATAN not found');
    }

    const rows: ImportRowData[] = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return;
      if (!row.getCell(1).value) return;
      
      rows.push({
        rowNumber,
        tanggal_kegiatann: String(row.getCell(1).value || ''),
        nama_kegiatann: String(row.getCell(2).value || ''),
        wilayah_kelompok: String(row.getCell(3).value || ''),
        wilayah_kabupaten: String(row.getCell(4).value || ''),
        wilayah_provinsi: String(row.getCell(5).value || ''),
        nama_koordinator: String(row.getCell(6).value || ''),
        nama_anggota: String(row.getCell(7).value || ''),
        jabatan_kegiatann: String(row.getCell(8).value || ''),
        nama_produk: String(row.getCell(9).value || ''),
        qty: Number(row.getCell(10).value) || 0,
        harga_satuan: Number(row.getCell(11).value) || 0,
        golongan: String(row.getCell(12).value || ''),
        status_order: String(row.getCell(13).value || ''),
        keterangan: String(row.getCell(14).value || ''),
      });
    });

    const importRecord = await this.prisma.import.create({
      data: {
        fileName: file.originalname,
        uploadedBy: userId,
        status: 'draft',
        totalRows: rows.length,
        storagePath: `uploads/${file.originalname}`,
      },
    });

    if (rows.length > 0) {
      await this.prisma.importRow.createMany({
        data: rows.map(r => ({
          importId: importRecord.id,
          rowNumber: r.rowNumber,
          payloadJson: r,
        })),
        skipDuplicates: true,
      });
    }

    return { import: importRecord, rowsCreated: rows.length };
  }

  async validate(importId: string) {
    const importRecord = await this.prisma.import.findUnique({
      where: { id: importId },
      include: { importRows: true },
    });
    if (!importRecord) throw new NotFoundException('Import not found');

    const results = [];
    for (const row of importRecord.importRows) {
      const data = row.payloadJson as ImportRowData;
      const validation = await this.validateRow(data);
      
      await this.prisma.importRow.update({
        where: { id: row.id },
        data: {
          validationStatus: validation.isValid ? 'valid' : 'invalid',
          validationMessage: validation.errors.join('; ') || validation.warnings.join('; '),
        },
      });
      results.push({ rowId: row.id, ...validation });
    }

    const validCount = results.filter(r => r.isValid).length;
    const invalidCount = results.filter(r => !r.isValid).length;

    await this.prisma.import.update({
      where: { id: importId },
      data: {
        status: invalidCount > 0 ? 'partial_success' : 'validated',
        validRows: validCount,
        invalidRows: invalidCount,
      },
    });

    return { validCount, invalidCount, results };
  }

  private async validateRow(data: ImportRowData): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.tanggal_kegiatann) errors.push('Tanggal kegiatan wajib diisi');
    if (!data.nama_kegiatann) errors.push('Nama kegiatan wajib diisi');
    if (!data.nama_koordinator) errors.push('Nama koordinator wajib diisi');
    if (!data.nama_anggota) errors.push('Nama anggota wajib diisi');
    if (!data.jabatan_kegiatann) errors.push('Jabatan kegiatan wajib diisi');
    if (!data.nama_produk) errors.push('Nama produk wajib diisi');
    if (!data.status_order) errors.push('Status order wajib diisi');
    if (data.qty < 0) errors.push('Qty tidak boleh negatif');
    if (data.harga_satuan < 0) errors.push('Harga tidak boleh negatif');

    const coordinator = await this.prisma.user.findFirst({
      where: { fullName: { contains: data.nama_koordinator, mode: 'insensitive' } },
    });
    if (!coordinator) errors.push('Koordinator tidak ditemukan');

    const member = await this.prisma.member.findFirst({
      where: { namaAnggota: { contains: data.nama_anggota, mode: 'insensitive' } },
    });
    if (!member) warnings.push('Anggota tidak ditemukan');

    const product = await this.prisma.product.findFirst({
      where: { namaProduk: { contains: data.nama_produk, mode: 'insensitive' } },
    });
    if (!product) errors.push('Produk tidak ditemukan');

    const status = await this.prisma.orderStatus.findFirst({
      where: { 
        OR: [
          { code: { equals: data.status_order, mode: 'insensitive' } },
          { name: { equals: data.status_order, mode: 'insensitive' } },
        ],
      },
    });
    if (!status) errors.push('Status tidak valid');

    return { isValid: errors.length === 0, errors, warnings };
  }

  async commit(importId: string) {
    const importRecord = await this.prisma.import.findUnique({
      where: { id: importId },
      include: { importRows: { where: { validationStatus: 'valid' } } },
    });
    if (!importRecord) throw new NotFoundException('Import not found');

    const results = [];
    for (const row of importRecord.importRows) {
      const data = row.payloadJson as ImportRowData;
      const result = await this.processRow(data, importId);
      results.push({ rowId: row.id, ...result });
    }

    await this.prisma.import.update({
      where: { id: importId },
      data: { status: 'imported' },
    });

    return { processed: results.length };
  }

  private async processRow(data: ImportRowData, importId: string) {
    // find or create branch
    let branch = await this.prisma.branch.findFirst({
      where: { 
        OR: [
          { wilayahKabupaten: { equals: data.wilayah_kabupaten, mode: 'insensitive' } },
          { wilayahKelompok: { equals: data.wilayah_kelompok, mode: 'insensitive' } },
        ],
      },
    });

    if (!branch) {
      branch = await this.prisma.branch.create({
        data: {
          kodeCabang: `IMP-${Date.now()}`,
          wilayahKelompok: data.wilayah_kelompok || '',
          wilayahKabupaten: data.wilayah_kabupaten || '',
          wilayahProvinsi: data.wilayah_provinsi || '',
          alamatCabang: '',
        },
      });
    }

    const coordinator = await this.prisma.user.findFirst({
      where: { fullName: { contains: data.nama_koordinator, mode: 'insensitive' } },
    });

    const member = await this.prisma.member.findFirst({
      where: { namaAnggota: { contains: data.nama_anggota, mode: 'insensitive' } },
    });

    const product = await this.prisma.product.findFirst({
      where: { namaProduk: { contains: data.nama_produk, mode: 'insensitive' } },
    });

    const activityPosition = await this.prisma.activityPosition.findFirst({
      where: { name: { contains: data.jabatan_kegiatann, mode: 'insensitive' } },
    });

    const status = await this.prisma.orderStatus.findFirst({
      where: { 
        OR: [
          { code: { equals: data.status_order, mode: 'insensitive' } },
          { name: { equals: data.status_order, mode: 'insensitive' } },
        ],
      },
    });

    const gol = data.golongan ? await this.prisma.golongan.findFirst({
      where: { name: { contains: data.golongan, mode: 'insensitive' } },
    }) : null;

    let activityId: string;
    const start = new Date(data.tanggal_kegiatann);
    start.setHours(0,0,0,0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const existingActivity = await this.prisma.activity.findFirst({
      where: {
        nama_kegiatann: data.nama_kegiatann,
        tanggal_kegiatan: { gte: start, lt: end },
      },
    });

    if (existingActivity) {
      activityId = existingActivity.id;
    } else {
      const activity = await this.prisma.activity.create({
        data: {
          tanggal_kegiatan: new Date(data.tanggal_kegiatann),
          nama_kegiatann: data.nama_kegiatann,
          branchId: branch.id,
          coordinatorId: coordinator?.id || '',
          deskripsi: data.keterangan,
          sourceImportId: importId,
          createdBy: coordinator?.id || '',
        },
      });
      activityId = activity.id;
    }

    if (member && activityPosition) {
      const existingAM = await this.prisma.activityMember.findFirst({ where: { activityId, memberId: member.id } });
      if (existingAM) {
        await this.prisma.activityMember.update({ where: { id: existingAM.id }, data: { activityPositionId: activityPosition.id, notes: data.keterangan } });
      } else {
        await this.prisma.activityMember.create({ data: { activityId, memberId: member.id, activityPositionId: activityPosition.id, notes: data.keterangan } });
      }
    }

    if (!product) {
      throw new BadRequestException('Product not found during commit');
    }

    if (!status) {
      throw new BadRequestException('Order status not found during commit');
    }

    const order = await this.prisma.order.create({
      data: {
        activityId,
        memberId: member?.id,
        productId: product.id,
        qty: data.qty,
        hargaSatuan: data.harga_satuan,
        totalHarga: data.qty * data.harga_satuan,
        golongantId: gol?.id,
        statusId: status.id,
        customerName: data.keterangan,
        notes: data.keterangan,
        dealAt: status.isDeal ? new Date() : null,
      },
    });

    return { activityId, orderId: order.id };
  }

  async findAll(status?: string) {
    return this.prisma.import.findMany({
      where: status ? { status: status as any } : undefined,
      include: { uploader: true },
      orderBy: { uploadedAt: 'desc' },
    });
  }

  async findById(id: string) {
    const importRecord = await this.prisma.import.findUnique({
      where: { id },
      include: { uploader: true, importRows: true },
    });
    if (!importRecord) throw new NotFoundException('Import not found');
    return importRecord;
  }
}
