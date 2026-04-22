import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { FinanceService } from './finance.service';
import {
  CreateLancamentoDto,
  UpdateLancamentoDto,
  QueryLancamentosDto,
  CloseMonthDto,
} from './dto/finance.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('entries')
  findAll(
    @CurrentUser('id') userId: string,
    @Query() query: QueryLancamentosDto,
  ) {
    return this.financeService.findAll(userId, query.mes, query.ano);
  }

  @Get('summary')
  getSummary(
    @CurrentUser('id') userId: string,
    @Query() query: QueryLancamentosDto,
  ) {
    return this.financeService.getSummary(userId, query.mes, query.ano);
  }

  @Post('entries')
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateLancamentoDto,
  ) {
    return this.financeService.create(userId, dto);
  }

  @Patch('entries/:id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLancamentoDto,
  ) {
    return this.financeService.update(userId, id, dto);
  }

  @Delete('entries/:id')
  delete(
    @CurrentUser('id') userId: string,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.financeService.delete(userId, id);
  }

  @Post('close-month')
  closeMonth(
    @CurrentUser('id') userId: string,
    @Body() dto: CloseMonthDto,
  ) {
    return this.financeService.closeMonth(userId, dto);
  }
}
