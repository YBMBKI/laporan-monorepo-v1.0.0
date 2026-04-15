import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kodeProduk: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  namaProduk: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  kategori?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  hargaDefault?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  pointThrDefault?: number;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
