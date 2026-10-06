import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';

export class CreateCandidateDto {
  @ApiProperty({ description: 'Nome completo do candidato', example: 'Ana Silva' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: 'E-mail do candidato (único)', example: 'ana.silva@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiPropertyOptional({ description: 'Telefone de contato', example: '+55 11 99999-8888' })
  @IsString()
  @IsOptional()
  phone?: string;
}
