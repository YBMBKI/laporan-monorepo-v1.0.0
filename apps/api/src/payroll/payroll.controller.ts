import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('payroll')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payroll')
export class PayrollController {
  constructor(private payrollService: PayrollService) {}

  @Get('rules')
  @ApiOperation({ summary: 'Get payroll rules' })
  getPayrollRules() {
    return this.payrollService.getPayrollRules();
  }

  @Post('rules')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create payroll rule' })
  createPayrollRule(@Body() data: any) {
    return this.payrollService.createPayrollRule(data);
  }

  @Get('periods')
  @ApiOperation({ summary: 'Get all payroll periods' })
  getPayrollPeriods() {
    return this.payrollService.getPayrollPeriods();
  }

  @Get('periods/:id')
  @ApiOperation({ summary: 'Get payroll period by id' })
  getPayrollPeriodById(@Param('id') id: string) {
    return this.payrollService.getPayrollPeriodById(id);
  }

  @Post('generate')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Generate payroll for period' })
  generatePayrollPeriod(@Body() body: { periodName: string; month: number; year: number; startDate: string; endDate: string }, @Request() req: any) {
    return this.payrollService.generatePayrollPeriod(
      body.periodName,
      body.month,
      body.year,
      new Date(body.startDate),
      new Date(body.endDate),
      req.user.userId,
    );
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get member payroll history' })
  getMemberPayrolls(@Param('memberId') memberId: string) {
    return this.payrollService.getMemberPayrolls(memberId);
  }

  @Get('calculate/:memberId')
  @ApiOperation({ summary: 'Calculate member payroll for date range' })
  calculateMemberPayroll(
    @Param('memberId') memberId: string,
    @Body() body: { startDate: string; endDate: string },
  ) {
    return this.payrollService.calculateMemberPayroll(
      memberId,
      new Date(body.startDate),
      new Date(body.endDate),
    );
  }
}
