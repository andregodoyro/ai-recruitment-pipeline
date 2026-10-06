import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CandidateStatus, Interview, InterviewStatus } from '@prisma/client';
import {
  IInterviewsRepository,
  INTERVIEWS_REPOSITORY,
} from '../../domain/interviews.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import { UpdateInterviewDto } from '../dtos/update-interview.dto';

@Injectable()
export class UpdateInterviewUseCase {
  constructor(
    @Inject(INTERVIEWS_REPOSITORY)
    private readonly interviewsRepository: IInterviewsRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
  ) {}

  async execute(id: string, dto: UpdateInterviewDto): Promise<Interview> {
    const interview = await this.interviewsRepository.findById(id);
    if (!interview) {
      throw new NotFoundException(`Entrevista com ID '${id}' não foi encontrada.`);
    }

    const updated = await this.interviewsRepository.update(id, {
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      meetingUrl: dto.meetingUrl,
      status: dto.status,
      notes: dto.notes,
    });

    // Se entrevista foi completada e status estiver COMPLETED, mantemos o candidato em fluxo
    // (pode ser contratado ou rejeitado na etapa subsequente/decisão)
    return updated;
  }
}
