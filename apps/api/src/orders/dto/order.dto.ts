import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  activityId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  memberId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  qty: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  hargaSatuan: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  golongantId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  statusId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderDto extends PartialType(CreateOrderDto) {}
