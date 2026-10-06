import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @ApiProperty({ example: 'Qual é o princípio SOLID de responsabilidade única?', description: 'Enunciado da questão' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  questionText: string;

  @ApiProperty({ enum: QuestionType, example: QuestionType.MULTIPLE_CHOICE, description: 'Tipo da questão' })
  @IsEnum(QuestionType)
  @IsNotEmpty()
  type: QuestionType;

  @ApiPropertyOptional({
    type: [String],
    example: ['SRP', 'OCP', 'DRY', 'YAGNI'],
    description: 'Opções de resposta (obrigatório para MULTIPLE_CHOICE e TRUE_FALSE)',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[];

  @ApiPropertyOptional({
    example: 'SRP',
    description: 'Resposta correta (obrigatório para MULTIPLE_CHOICE e TRUE_FALSE, null para OPEN_TEXT)',
  })
  @IsString()
  @IsOptional()
  correctAnswer?: string;

  @ApiPropertyOptional({ example: 1.0, description: 'Peso da questão no cálculo do score (padrão: 1.0)', minimum: 0.1, maximum: 10 })
  @IsNumber()
  @Min(0.1)
  @Max(10)
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ example: 1, description: 'Posição da questão no teste (padrão: 0)', minimum: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  order?: number;
}
