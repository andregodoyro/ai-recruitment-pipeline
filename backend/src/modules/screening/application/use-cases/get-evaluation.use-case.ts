import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Evaluation } from '@prisma/client';
import {
  IScreeningRepository,
  SCREENING_REPOSITORY,
} from '../../domain/screening.repository.interface';

@Injectable()
export class GetEvaluationUseCase {
  constructor(
    @Inject(SCREENING_REPOSITORY)
    private readonly screeningRepository: IScreeningRepository,
  ) {}

  async execute(id: string): Promise<Evaluation> {
    const evaluation = await this.screeningRepository.findById(id);
    if (!evaluation) {
      throw new NotFoundException(`Avaliação com ID '${id}' não foi encontrada.`);
    }
    return evaluation;
  }
}
