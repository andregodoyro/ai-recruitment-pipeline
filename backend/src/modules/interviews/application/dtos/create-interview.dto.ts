import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsOptional, IsString, IsUUID, IsUrl, MaxLength } from 'class-validator';

export class CreateInterviewDto {
  @ApiProperty({ example: '11111111-1111-4111-a111-111111111111', description: 'UUID do candidato' })
  @IsUUID()
  @IsNotEmpty()
  candidateId: string;

  @ApiProperty({ example: '22222222-2222-4222-a222-222222222222', description: 'UUID da vaga' })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ example: '2026-10-15T14:30:00.000Z', description: 'Data e hora agendada para a entrevista (ISO-8601)' })
  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @ApiPropertyOptional({ example: 'https://meet.google.com/abc-defg-hij', description: 'Link da reunião online' })
  @IsUrl()
  @IsOptional()
  meetingUrl?: string;

  @ApiPropertyOptional({ example: 'Entrevista técnica com tech lead e gestor da área', description: 'Notas ou observações' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
