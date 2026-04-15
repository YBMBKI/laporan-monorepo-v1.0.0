import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kodeCabang: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wilayahKelompok: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wilayahKabupaten: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wilayahProvinsi: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  alamatCabang?: string;
}

export class UpdateBranchDto extends PartialType(CreateBranchDto) {}
