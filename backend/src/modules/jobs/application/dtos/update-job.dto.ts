import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ExperienceLevel, JobStatus } from '@prisma/client';

export class UpdateJobDto {
  @ApiPropertyOptional({ description: 'Ttulo da vaga' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrio detalhada das atividades' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Requisitos tcnicos e comportamentais obrigatrios' })
  @IsString()
  @IsOptional()
  requirements?: string;

  @ApiPropertyOptional({ description: 'Competncias desejveis' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredSkills?: string[];

  @ApiPropertyOptional({ enum: ExperienceLevel, description: 'Nvel de experincia' })
  @IsEnum(ExperienceLevel)
  @IsOptional()
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({ enum: JobStatus, description: 'Status da vaga' })
  @IsEnum(JobStatus)
  @IsOptional()
  status?: JobStatus;

  @ApiPropertyOptional({ description: 'Peso para Formao Acadmica (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  educationWeight?: number;

  @ApiPropertyOptional({ description: 'Peso para Automao (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  automationWeight?: number;

  @ApiPropertyOptional({ description: 'Peso para Dados (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  dataWeight?: number;

  @ApiPropertyOptional({ description: 'Peso para Experincia (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  experienceWeight?: number;

  @ApiPropertyOptional({ description: 'Peso para Tecnologia (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  technologyWeight?: number;

  @ApiPropertyOptional({ description: 'Peso para Comportamental (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  behavioralWeight?: number;

  @ApiPropertyOptional({ description: 'Peso do Currculo no Ranking Final (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rankingResumeWeight?: number;

  @ApiPropertyOptional({ description: 'Peso do Teste no Ranking Final (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rankingTestWeight?: number;
}
