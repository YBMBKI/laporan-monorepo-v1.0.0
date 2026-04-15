import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get dashboard summary' })
  getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('sales-trend')
  @ApiOperation({ summary: 'Get sales trend' })
  getSalesTrend(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getSalesTrend(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('status-distribution')
  @ApiOperation({ summary: 'Get status distribution' })
  getStatusDistribution(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.dashboardService.getStatusDistribution(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
