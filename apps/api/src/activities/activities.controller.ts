import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto, UpdateActivityDto, AddMemberDto } from './dto/activity.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('activities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('activities')
export class ActivitiesController {
  constructor(private activitiesService: ActivitiesService) {}

  @Post()
  @Roles('super_admin', 'admin_yayasan', 'koordinator')
  @ApiOperation({ summary: 'Create new activity' })
  create(@Body() createActivityDto: CreateActivityDto, @Request() req: any) {
    return this.activitiesService.create(createActivityDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all activities' })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('coordinatorId') coordinatorId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.activitiesService.findAll(
      branchId,
      coordinatorId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity by id' })
  findOne(@Param('id') id: string) {
    return this.activitiesService.findById(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin_yayasan', 'koordinator')
  @ApiOperation({ summary: 'Update activity' })
  update(@Param('id') id: string, @Body() updateActivityDto: UpdateActivityDto) {
    return this.activitiesService.update(id, updateActivityDto);
  }

  @Delete(':id')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Delete activity' })
  remove(@Param('id') id: string) {
    return this.activitiesService.remove(id);
  }

  @Post(':id/members')
  @Roles('super_admin', 'admin_yayasan', 'koordinator')
  @ApiOperation({ summary: 'Add member to activity' })
  addMember(@Param('id') id: string, @Body() addMemberDto: AddMemberDto) {
    return this.activitiesService.addMember(id, addMemberDto.memberId, addMemberDto.activityPositionId, addMemberDto.notes);
  }

  @Delete(':id/members/:memberId')
  @Roles('super_admin', 'admin_yayasan', 'koordinator')
  @ApiOperation({ summary: 'Remove member from activity' })
  removeMember(@Param('id') id: string, @Param('memberId') memberId: string) {
    return this.activitiesService.removeMember(id, memberId);
  }
}
