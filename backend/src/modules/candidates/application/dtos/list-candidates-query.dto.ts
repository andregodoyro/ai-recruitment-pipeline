import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { CandidateStatus } from '@prisma/client';

export class ListCandidatesQueryDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: CandidateStatus, description: 'Filtrar por status' })
  @IsOptional()
  @IsEnum(CandidateStatus)
  status?: CandidateStatus;

  @ApiPropertyOptional({ description: 'Busca por nome ou e-mail' })
  @IsOptional()
  @IsString()
  search?: string;
}
