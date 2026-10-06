import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class UpdateJobStatusDto {
  @ApiProperty({ enum: JobStatus, description: 'Novo status da vaga (OPEN, CLOSED, ARCHIVED)', example: JobStatus.OPEN })
  @IsEnum(JobStatus)
  @IsNotEmpty()
  status!: JobStatus;
}
