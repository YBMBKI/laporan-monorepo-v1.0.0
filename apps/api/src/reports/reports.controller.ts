import { Controller, Get, Query, UseGuards, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Get('sales')
  @ApiOperation({ summary: 'Get sales report' })
  getSalesReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
    @Query('memberId') memberId?: string,
    @Query('coordinatorId') coordinatorId?: string,
    @Query('productId') productId?: string,
    @Query('statusId') statusId?: string,
    @Query('wilayahKabupaten') wilayahKabupaten?: string,
  ) {
    return this.reportsService.getSalesReport(
      new Date(startDate),
      new Date(endDate),
      { branchId, memberId, coordinatorId, productId, statusId, wilayahKabupaten },
    );
  }

  @Get('sales/export-xlsx')
  @ApiOperation({ summary: 'Export sales report to XLSX' })
  async exportSalesXlsx(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Res() res: Response,
  ) {
    const workbook = await this.reportsService.exportSalesXlsx(
      new Date(startDate),
      new Date(endDate),
      {},
    );
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=laporan_penjualan.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  }

  @Get('foundation')
  @ApiOperation({ summary: 'Get foundation monthly report' })
  getFoundationReport(
    @Query('month') month: number,
    @Query('year') year: number,
  ) {
    return this.reportsService.getFoundationReport(month, year);
  }

  @Get('performance')
  @ApiOperation({ summary: 'Get member performance report' })
  getPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('branchId') branchId?: string,
    @Query('memberId') memberId?: string,
    @Query('positionId') positionId?: string,
  ) {
    return this.reportsService.getPerformanceReport(
      new Date(startDate),
      new Date(endDate),
      { branchId, memberId, positionId },
    );
  }
}
