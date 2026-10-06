import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';

export class EvaluateResumeDto {
  @ApiProperty({ description: 'UUID do candidato', example: 'uuid-candidate' })
  @IsUUID()
  @IsNotEmpty()
  candidateId!: string;

  @ApiProperty({ description: 'UUID da vaga', example: 'uuid-job' })
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;

  @ApiPropertyOptional({ description: 'UUID do currículo a ser avaliado (opcional, se omitido usa o currículo ativo)' })
  @IsUUID()
  @IsOptional()
  resumeId?: string;
}
