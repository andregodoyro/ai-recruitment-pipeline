import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Interview } from '@prisma/client';
import {
  IInterviewsRepository,
  INTERVIEWS_REPOSITORY,
} from '../../domain/interviews.repository.interface';

@Injectable()
export class GetInterviewUseCase {
  constructor(
    @Inject(INTERVIEWS_REPOSITORY)
    private readonly interviewsRepository: IInterviewsRepository,
  ) {}

  async execute(id: string): Promise<Interview> {
    const interview = await this.interviewsRepository.findById(id);
    if (!interview) {
      throw new NotFoundException(`Entrevista com ID '${id}' não foi encontrada.`);
    }

    return interview;
  }
}
