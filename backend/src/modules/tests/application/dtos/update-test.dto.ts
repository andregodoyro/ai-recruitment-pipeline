import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTestDto {
  @ApiPropertyOptional({ example: 'Teste Técnico Backend Atualizado', description: 'Novo título do teste' })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: 'Descrição atualizada do teste', description: 'Nova descrição do teste' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
