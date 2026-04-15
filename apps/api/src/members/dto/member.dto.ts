import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateMemberDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kodeAnggota: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namaAnggota: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  positionId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  noHp?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  alamat?: string;
}

export class UpdateMemberDto extends PartialType(CreateMemberDto) {
  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  statusAktif?: boolean;
}
