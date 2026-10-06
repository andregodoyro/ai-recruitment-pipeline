import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

export class ListInterviewsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por UUID da vaga' })
  @IsUUID()
  @IsOptional()
  jobId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por UUID do candidato' })
  @IsUUID()
  @IsOptional()
  candidateId?: string;

  @ApiPropertyOptional({ enum: InterviewStatus, description: 'Filtrar por status da entrevista' })
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10, minimum: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number;
}
