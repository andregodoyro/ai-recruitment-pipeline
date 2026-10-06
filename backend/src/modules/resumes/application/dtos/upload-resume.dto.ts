import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class UploadResumeDto {
  @ApiProperty({ description: 'UUID do candidato', example: 'uuid-candidate' })
  @IsUUID()
  @IsNotEmpty()
  candidateId!: string;

  @ApiProperty({ description: 'UUID da vaga associada', example: 'uuid-job' })
  @IsUUID()
  @IsNotEmpty()
  jobId!: string;
}
