import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { QuestionType } from '@prisma/client';

export class UpdateQuestionDto {
  @ApiPropertyOptional({ example: 'Qual é o conceito de Injeção de Dependências?', description: 'Novo enunciado da questão' })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  questionText?: string;

  @ApiPropertyOptional({ enum: QuestionType, description: 'Novo tipo da questão' })
  @IsEnum(QuestionType)
  @IsOptional()
  type?: QuestionType;

  @ApiPropertyOptional({ type: [String], description: 'Novas opções de resposta' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({ description: 'Nova resposta correta' })
  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @ApiPropertyOptional({ minimum: 0.1, maximum: 10, description: 'Novo peso da questão' })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Nova posição da questão no teste' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
