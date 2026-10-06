import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { TestStatus } from '@prisma/client';

export class UpdateTestStatusDto {
  @ApiProperty({
    enum: TestStatus,
    example: TestStatus.PUBLISHED,
    description: 'Novo status do teste. Transições válidas: DRAFT→PUBLISHED, PUBLISHED→CLOSED',
  })
  @IsEnum(TestStatus)
  @IsNotEmpty()
  status: TestStatus;
}
