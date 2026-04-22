import { IsString, IsNumber, IsOptional, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLancamentoDto {
  @IsIn(['gasto', 'ganho'])
  tipo!: 'gasto' | 'ganho';

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  valor!: number;

  @IsString()
  categoria!: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class UpdateLancamentoDto {
  @IsOptional()
  @IsIn(['gasto', 'ganho'])
  tipo?: 'gasto' | 'ganho';

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Type(() => Number)
  valor?: number;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsString()
  descricao?: string;
}

export class QueryLancamentosDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  mes?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  ano?: number;
}

export class CloseMonthDto {
  @Type(() => Number)
  @IsNumber()
  mes!: number;

  @Type(() => Number)
  @IsNumber()
  ano!: number;
}
