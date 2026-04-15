import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFoundationSettingsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  foundationName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  officeName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  officeAddress: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  province: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reportHeaderLogo?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reportSignatureName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reportSignatureTitle?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reportFooterNotes?: string;
}
