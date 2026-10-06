import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class AnswerItemDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID da questão respondida' })
  @IsUUID()
  @IsNotEmpty()
  questionId: string;

  @ApiPropertyOptional({
    example: 'SRP',
    description: 'Texto da resposta (letra/opção para MC/TF, texto livre para OPEN_TEXT)',
  })
  @IsString()
  @IsOptional()
  answerText?: string;
}

export class SubmitAnswersDto {
  @ApiProperty({
    type: [AnswerItemDto],
    description: 'Lista de respostas do candidato para cada questão do teste',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers: AnswerItemDto[];
}
