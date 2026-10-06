import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { CandidateStatus } from '@prisma/client';

export class UpdateCandidateDto {
  @ApiPropertyOptional({ description: 'Nome do candidato' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'E-mail do candidato' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Telefone de contato' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ enum: CandidateStatus, description: 'Status do candidato' })
  @IsEnum(CandidateStatus)
  @IsOptional()
  status?: CandidateStatus;
}
