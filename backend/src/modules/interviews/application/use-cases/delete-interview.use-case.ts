import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  IInterviewsRepository,
  INTERVIEWS_REPOSITORY,
} from '../../domain/interviews.repository.interface';

@Injectable()
export class DeleteInterviewUseCase {
  constructor(
    @Inject(INTERVIEWS_REPOSITORY)
    private readonly interviewsRepository: IInterviewsRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const interview = await this.interviewsRepository.findById(id);
    if (!interview) {
      throw new NotFoundException(`Entrevista com ID '${id}' não foi encontrada.`);
    }

    await this.interviewsRepository.delete(id);
  }
}
