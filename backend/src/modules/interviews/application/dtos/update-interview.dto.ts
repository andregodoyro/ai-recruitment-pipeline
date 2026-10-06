import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';
import { InterviewStatus } from '@prisma/client';

export class UpdateInterviewDto {
  @ApiPropertyOptional({ example: '2026-10-16T15:00:00.000Z', description: 'Nova data e hora da entrevista' })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/xyz-uvwx-rst', description: 'Novo link da reunião' })
  @IsUrl()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional({ enum: InterviewStatus, description: 'Novo status da entrevista' })
  @IsEnum(InterviewStatus)
  @IsOptional()
  status?: InterviewStatus;

  @ApiPropertyOptional({ example: 'Feedback: Candidato aprovado tecnicamente', description: 'Notas ou feedback' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
