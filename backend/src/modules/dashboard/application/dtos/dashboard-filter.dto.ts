import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class DashboardFilterDto {
  @ApiPropertyOptional({ description: 'Filtrar métricas por UUID da vaga' })
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Data de início do período (ISO-8601)' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data de término do período (ISO-8601)' })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
