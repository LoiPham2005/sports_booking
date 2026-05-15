import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/roles.decorator';
import { SportsService } from './sports.service';

@ApiTags('sports')
@Controller('sports')
export class SportsController {
  constructor(private sports: SportsService) {}

  @Public()
  @Get()
  list() {
    return this.sports.list();
  }

  @Public()
  @Get(':slug')
  detail(@Param('slug') slug: string) {
    return this.sports.bySlug(slug);
  }
}
