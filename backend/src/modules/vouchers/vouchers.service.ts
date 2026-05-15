import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, VoucherScope, VoucherType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateVoucherDto, ListVouchersDto, UpdateVoucherDto } from './dto/voucher.dto';

@Injectable()
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async list(dto: ListVouchersDto) {
    const where: Prisma.VoucherWhereInput = {};
    if (dto.scope) where.scope = dto.scope;
    if (typeof dto.active === 'boolean') where.isActive = dto.active;
    if (dto.q) where.code = { contains: dto.q, mode: 'insensitive' };

    return this.prisma.voucher.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: dto.limit ?? 50,
      include: { _count: { select: { redemptions: true } } },
    });
  }

  async create(dto: CreateVoucherDto) {
    if (dto.type === VoucherType.PERCENT && (dto.value < 1 || dto.value > 100)) {
      throw new BadRequestException('Percent value must be 1-100');
    }
    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        type: dto.type,
        value: dto.value,
        maxDiscount: dto.maxDiscount,
        minOrder: dto.minOrder,
        validFrom: new Date(dto.validFrom),
        validTo: new Date(dto.validTo),
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        scope: dto.scope ?? VoucherScope.GLOBAL,
        scopeRefId: dto.scopeRefId,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateVoucherDto) {
    const v = await this.prisma.voucher.findUnique({ where: { id } });
    if (!v) throw new NotFoundException();
    return this.prisma.voucher.update({
      where: { id },
      data: {
        value: dto.value,
        maxDiscount: dto.maxDiscount,
        minOrder: dto.minOrder,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : undefined,
        validTo: dto.validTo ? new Date(dto.validTo) : undefined,
        usageLimit: dto.usageLimit,
        perUserLimit: dto.perUserLimit,
        isActive: dto.isActive,
      },
    });
  }

  async remove(id: string) {
    // Soft-disable thay vì delete (giữ history redemption)
    return this.prisma.voucher.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
