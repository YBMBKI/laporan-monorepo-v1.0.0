import { Controller, Get, Post, Body, Param, UseGuards, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

@ApiTags('imports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('imports')
export class ImportsController {
  constructor(private importsService: ImportsService) {}

  @Post('upload')
  @Roles('super_admin', 'admin_yayasan', 'koordinator')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload XLSX file for import' })
  async upload(@UploadedFile() file: Express.Multer.File, @Request() req: any) {
    return this.importsService.upload(file, req.user.userId);
  }

  @Post(':id/validate')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Validate import data' })
  validate(@Param('id') id: string) {
    return this.importsService.validate(id);
  }

  @Post(':id/commit')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Commit import to database' })
  commit(@Param('id') id: string) {
    return this.importsService.commit(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all imports' })
  findAll() {
    return this.importsService.findAll();
  }
  @Get('template/download')
  @Public()
  @ApiOperation({ summary: 'Download import template' })
  async downloadTemplate(@Res() res: Response) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('PETUNJUK');
    
    worksheet.addRow(['TXT TEMPLATE IMPOR LAPORAN KEGIATAN YBMBKI']);
    worksheet.addRow(['']);
    worksheet.addRow(['Kolom', 'Deskripsi', 'Format', 'Wajib']);
    worksheet.addRow(['tanggal_kegiatann', 'Tanggal kegiatan', 'YYYY-MM-DD', 'Ya']);
    worksheet.addRow(['nama_kegiatann', 'Nama kegiatan', 'Teks', 'Ya']);
    worksheet.addRow(['wilayah_kelompok', 'Wilayah Kelompok', 'Teks', 'Ya']);
    worksheet.addRow(['wilayah_kabupaten', 'Wilayah Kabupaten', 'Teks', 'Ya']);
    worksheet.addRow(['wilayah_provinsi', 'Wilayah Provinsi', 'Teks', 'Ya']);
    worksheet.addRow(['nama_koordinator', 'Nama Koordinator', 'Teks', 'Ya']);
    worksheet.addRow(['nama_anggota', 'Nama Anggota', 'Teks', 'Ya']);
    worksheet.addRow(['jabatan_kegiatann', 'Jabatan Kegiatan (konsultan/surveyor/pribadi)', 'Teks', 'Ya']);
    worksheet.addRow(['nama_produk', 'Nama Produk', 'Teks', 'Ya']);
    worksheet.addRow(['qty', 'Jumlah', 'Angka', 'Ya']);
    worksheet.addRow(['harga_satuan', 'Harga Satuan', 'Angka', 'Ya']);
    worksheet.addRow(['golongan', 'Golongan', 'Teks', 'Tidak']);
    worksheet.addRow(['status_order', 'Status (pending/deal/cancel/terkirim)', 'Teks', 'Ya']);
    worksheet.addRow(['keterangan', 'Keterangan', 'Teks', 'Tidak']);

    const dataSheet = workbook.addWorksheet('LAPORAN_KEGIATAN');
    dataSheet.addRow([
      'tanggal_kegiatann', 'nama_kegiatann', 'wilayah_kelompok', 'wilayah_kabupaten', 
      'wilayah_provinsi', 'nama_koordinator', 'nama_anggota', 'jabatan_kegiatann',
      'nama_produk', 'qty', 'harga_satuan', 'golongan', 'status_order', 'keterangan'
    ]);
    dataSheet.addRow([
      '2024-01-15', 'Penyuluhan Kecantikan', 'Pucang', 'Bawang', 
      'Jawa Tengah', 'Ahmad Santoso', 'Budi Susanto', 'konsultan',
      'Krim Malam', 5, 50000, '', 'deal', 'Terjual ke Ibu Siti'
    ]);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=template_import.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get import by id' })
  findOne(@Param('id') id: string) {
    return this.importsService.findById(id);
  }
}
