import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty()
  @IsDateString()
  tanggal_kegiatann: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nama_kegiatann: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  coordinatorId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  deskripsi?: string;

  @ApiProperty({ enum: ['harian', 'mingguan'], required: false })
  @IsEnum(['harian', 'mingguan'])
  @IsOptional()
  periodeType?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sourceImportId?: string;
}

export class UpdateActivityDto extends PartialType(CreateActivityDto) {}

export class AddMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activityPositionId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
