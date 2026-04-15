import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto/member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('members')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Post()
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Create new member' })
  create(@Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members' })
  @ApiQuery({ name: 'branchId', required: false })
  @ApiQuery({ name: 'positionId', required: false })
  @ApiQuery({ name: 'statusAktif', required: false })
  findAll(
    @Query('branchId') branchId?: string,
    @Query('positionId') positionId?: string,
    @Query('statusAktif') statusAktif?: string,
  ) {
    return this.membersService.findAll(
      branchId,
      positionId,
      statusAktif === 'true' ? true : statusAktif === 'false' ? false : undefined,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by id' })
  findOne(@Param('id') id: string) {
    return this.membersService.findById(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Update member' })
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this.membersService.update(id, updateMemberDto);
  }

  @Delete(':id')
  @Roles('super_admin')
  @ApiOperation({ summary: 'Delete member' })
  remove(@Param('id') id: string) {
    return this.membersService.remove(id);
  }

  @Patch(':id/toggle-active')
  @Roles('super_admin', 'admin_yayasan')
  @ApiOperation({ summary: 'Toggle member active status' })
  toggleActive(@Param('id') id: string) {
    return this.membersService.toggleActive(id);
  }
}
