import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { RequirePermission } from '../../common/decorators/permissions.decorator';
import { VouchersService } from './vouchers.service';
import {
  CreateVoucherDto,
  ListVouchersDto,
  UpdateVoucherDto,
} from './dto/voucher.dto';

@ApiBearerAuth()
@ApiTags('vouchers')
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@Controller('admin/vouchers')
export class VouchersController {
  constructor(private vouchers: VouchersService) {}

  @Get()
  list(@Query() q: ListVouchersDto) {
    return this.vouchers.list(q);
  }

  @Post()
  @RequirePermission('voucher.create')
  create(@Body() dto: CreateVoucherDto) {
    return this.vouchers.create(dto);
  }

  @Patch(':id')
  @RequirePermission('voucher.update')
  update(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.vouchers.update(id, dto);
  }

  @Delete(':id')
  @RequirePermission('voucher.delete')
  remove(@Param('id') id: string) {
    return this.vouchers.remove(id);
  }
}
