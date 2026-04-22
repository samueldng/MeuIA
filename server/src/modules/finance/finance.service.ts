import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateLancamentoDto,
  UpdateLancamentoDto,
  CloseMonthDto,
} from './dto/finance.dto';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, mes?: number, ano?: number) {
    const where: Prisma.LancamentoWhereInput = { userId };

    if (mes && ano) {
      const startDate = new Date(ano, mes - 1, 1);
      const endDate = new Date(ano, mes, 1);
      where.data = { gte: startDate, lt: endDate };
    }

    return this.prisma.lancamento.findMany({
      where,
      orderBy: { data: 'desc' },
      take: 100,
    });
  }

  async create(userId: string, dto: CreateLancamentoDto) {
    return this.prisma.lancamento.create({
      data: {
        userId,
        tipo: dto.tipo,
        valor: new Prisma.Decimal(dto.valor),
        categoria: dto.categoria,
        descricao: dto.descricao ?? null,
      },
    });
  }

  async update(userId: string, id: number, dto: UpdateLancamentoDto) {
    const existing = await this.prisma.lancamento.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Lançamento #${id} não encontrado`);
    }

    return this.prisma.lancamento.update({
      where: { id },
      data: {
        ...(dto.tipo && { tipo: dto.tipo }),
        ...(dto.valor && { valor: new Prisma.Decimal(dto.valor) }),
        ...(dto.categoria && { categoria: dto.categoria }),
        ...(dto.descricao !== undefined && { descricao: dto.descricao }),
      },
    });
  }

  async delete(userId: string, id: number) {
    const existing = await this.prisma.lancamento.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new NotFoundException(`Lançamento #${id} não encontrado`);
    }

    await this.prisma.lancamento.delete({ where: { id } });
    return { deleted: true };
  }

  async getSummary(userId: string, mes?: number, ano?: number) {
    const entries = await this.findAll(userId, mes, ano);

    const totals = entries.reduce(
      (acc, l) => {
        const val = Number(l.valor);
        if (l.tipo === 'ganho') acc.income += val;
        else acc.expense += val;
        return acc;
      },
      { income: 0, expense: 0 },
    );

    return {
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
      count: entries.length,
    };
  }

  async closeMonth(userId: string, dto: CloseMonthDto) {
    const summary = await this.getSummary(userId, dto.mes, dto.ano);

    if (summary.balance !== 0) {
      // Carry balance forward as "Saldo Anterior" in next month
      let nextMonth = dto.mes + 1;
      let nextYear = dto.ano;
      if (nextMonth > 12) {
        nextMonth = 1;
        nextYear += 1;
      }

      await this.prisma.lancamento.create({
        data: {
          userId,
          tipo: summary.balance > 0 ? 'ganho' : 'gasto',
          valor: new Prisma.Decimal(Math.abs(summary.balance)),
          categoria: 'Saldo Anterior',
          descricao: `Saldo transportado de ${dto.mes}/${dto.ano}`,
          data: new Date(nextYear, nextMonth - 1, 1),
        },
      });
    }

    this.logger.log(
      `Month ${dto.mes}/${dto.ano} closed for user ${userId}. Balance: ${summary.balance}`,
    );

    return {
      success: true,
      saldoAnterior: summary.balance,
      message: `Mês ${dto.mes}/${dto.ano} fechado com sucesso.`,
    };
  }
}
