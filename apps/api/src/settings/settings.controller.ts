import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { CreateFoundationSettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('settings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('foundation')
  @ApiOperation({ summary: 'Get foundation settings' })
  getFoundationSettings() {
    return this.settingsService.getFoundationSettings();
  }

  @Post('foundation')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Create or update foundation settings' })
  createOrUpdateFoundationSettings(@Body() dto: CreateFoundationSettingsDto) {
    return this.settingsService.createOrUpdateFoundationSettings(dto);
  }

  @Get('order-statuses')
  @ApiOperation({ summary: 'Get order statuses' })
  getOrderStatuses() {
    return this.settingsService.getOrderStatuses();
  }

  @Post('order-statuses')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create order status' })
  createOrderStatus(@Body() data: any) {
    return this.settingsService.createOrderStatus(data);
  }

  @Get('golongans')
  @ApiOperation({ summary: 'Get golongans' })
  getGolongans() {
    return this.settingsService.getGolongans();
  }

  @Post('golongans')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create golongan' })
  createGolongan(@Body() data: any) {
    return this.settingsService.createGolongan(data);
  }

  @Get('activity-positions')
  @ApiOperation({ summary: 'Get activity positions' })
  getActivityPositions() {
    return this.settingsService.getActivityPositions();
  }

  @Post('activity-positions')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create activity position' })
  createActivityPosition(@Body() data: any) {
    return this.settingsService.createActivityPosition(data);
  }

  @Get('member-positions')
  @ApiOperation({ summary: 'Get member positions' })
  getMemberPositions() {
    return this.settingsService.getMemberPositions();
  }

  @Post('member-positions')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create member position' })
  createMemberPosition(@Body() data: any) {
    return this.settingsService.createMemberPosition(data);
  }
}
