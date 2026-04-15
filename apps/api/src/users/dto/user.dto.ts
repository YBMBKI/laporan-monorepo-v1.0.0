import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  username: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ enum: ['super_admin', 'admin_yayasan', 'koordinator', 'anggota', 'viewer'] })
  @IsEnum(['super_admin', 'admin_yayasan', 'koordinator', 'anggota', 'viewer'])
  role: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  memberId?: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  passwordHash?: string;
}
