import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ArrayUnique, IsArray, IsEnum, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({ type: [String], description: 'Danh sách permission key (sẽ replace toàn bộ permission của role)' })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  keys!: string[];
}

export class SetRolePermissionParamsDto {
  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role!: Role;
}
