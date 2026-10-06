import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateTestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID da vaga associada ao teste' })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  @ApiProperty({ example: 'Teste Técnico Backend', description: 'Título do teste' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ example: 'Teste para avaliar conhecimentos em NestJS e TypeScript', description: 'Descrição opcional do teste' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
