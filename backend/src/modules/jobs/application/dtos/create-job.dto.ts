import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsArray,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ExperienceLevel } from '@prisma/client';

export class CreateJobDto {
  @ApiProperty({ description: 'Ttulo da vaga', example: 'Desenvolvedor Backend Sr' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'Descrio detalhada das atividades', example: 'Responsvel pelo desenvolvimento da API REST' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ description: 'Requisitos tcnicos e comportamentais obrigatrios', example: 'Node.js, TypeScript, NestJS, PostgreSQL' })
  @IsString()
  @IsNotEmpty()
  requirements!: string;

  @ApiPropertyOptional({ description: 'Competncias desejveis (diferenciais)', example: ['Docker', 'AWS', 'Microservices'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  desiredSkills?: string[];

  @ApiProperty({ enum: ExperienceLevel, description: 'Nvel de experincia', example: ExperienceLevel.SENIOR })
  @IsEnum(ExperienceLevel)
  experienceLevel!: ExperienceLevel;

  @ApiPropertyOptional({ description: 'Peso para Formao Acadmica (0-100)', example: 15, default: 15 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  educationWeight?: number = 15;

  @ApiPropertyOptional({ description: 'Peso para Automao (0-100)', example: 20, default: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  automationWeight?: number = 20;

  @ApiPropertyOptional({ description: 'Peso para Dados (0-100)', example: 20, default: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  dataWeight?: number = 20;

  @ApiPropertyOptional({ description: 'Peso para Experincia (0-100)', example: 20, default: 20 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  experienceWeight?: number = 20;

  @ApiPropertyOptional({ description: 'Peso para Tecnologia (0-100)', example: 15, default: 15 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  technologyWeight?: number = 15;

  @ApiPropertyOptional({ description: 'Peso para Comportamental (0-100)', example: 10, default: 10 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  behavioralWeight?: number = 10;

  @ApiPropertyOptional({ description: 'Peso do Currculo no Ranking Final (0-100)', example: 60, default: 60 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rankingResumeWeight?: number = 60;

  @ApiPropertyOptional({ description: 'Peso do Teste no Ranking Final (0-100)', example: 40, default: 40 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  rankingTestWeight?: number = 40;
}
