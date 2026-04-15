import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ThrService } from './thr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('thr')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thr')
export class ThrController {
  constructor(private thrService: ThrService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Get THR rules' })
  getThrRules() {
    return this.thrService.getThrRules();
  }

  @Post('rules')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create THR rule' })
  createThrRule(@Body() data: any) {
    return this.thrService.createThrRule(data);
  }

  @Get('calculate/:memberId')
  @ApiOperation({ summary: 'Calculate member THR for date range' })
  calculateMemberThr(
    @Param('memberId') memberId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('pointPerQty') pointPerQty?: string,
    @Query('rupiahPerPoint') rupiahPerPoint?: string,
  ) {
    const s = startDate ? new Date(startDate) : undefined;
    const e = endDate ? new Date(endDate) : undefined;
    return this.thrService.calculateMemberThr(
      memberId,
      s as Date,
      e as Date,
      pointPerQty ? Number(pointPerQty) : undefined,
      rupiahPerPoint ? Number(rupiahPerPoint) : undefined,
    );
  }

  @Post('calculate-all')
  @ApiOperation({ summary: 'Calculate THR for all members' })
  calculateAllMemberThr(
    @Body() body: { startDate: string; endDate: string; pointPerQty?: number; rupiahPerPoint?: number },
  ) {
    return this.thrService.calculateAllMemberThr(
      new Date(body.startDate),
      new Date(body.endDate),
      body.pointPerQty,
      body.rupiahPerPoint,
    );
  }
}
