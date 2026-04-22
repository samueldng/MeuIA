import { IsString, IsOptional, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsString()
  @MinLength(1)
  mensagem!: string;

  @IsOptional()
  @IsString()
  nome_ia?: string;
}
