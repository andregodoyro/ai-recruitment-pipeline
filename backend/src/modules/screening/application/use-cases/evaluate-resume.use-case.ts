import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Evaluation, CandidateStatus, Recommendation, Resume } from '@prisma/client';
import {
  IScreeningRepository,
  SCREENING_REPOSITORY,
} from '../../domain/screening.repository.interface';
import {
  ICandidatesRepository,
  CANDIDATES_REPOSITORY,
} from '../../../candidates/domain/candidates.repository.interface';
import {
  IJobsRepository,
  JOBS_REPOSITORY,
} from '../../../jobs/domain/jobs.repository.interface';
import {
  IResumesRepository,
  RESUMES_REPOSITORY,
} from '../../../resumes/domain/resumes.repository.interface';
import {
  IAIRecruitmentEvaluator,
  AI_RECRUITMENT_EVALUATOR,
} from '../../../../ai/interfaces/ai-evaluator.interface';
import { EvaluateResumeDto } from '../dtos/evaluate-resume.dto';

@Injectable()
export class EvaluateResumeUseCase {
  constructor(
    @Inject(SCREENING_REPOSITORY)
    private readonly screeningRepository: IScreeningRepository,
    @Inject(CANDIDATES_REPOSITORY)
    private readonly candidatesRepository: ICandidatesRepository,
    @Inject(JOBS_REPOSITORY)
    private readonly jobsRepository: IJobsRepository,
    @Inject(RESUMES_REPOSITORY)
    private readonly resumesRepository: IResumesRepository,
    @Inject(AI_RECRUITMENT_EVALUATOR)
    private readonly aiEvaluator: IAIRecruitmentEvaluator,
  ) {}

  async execute(dto: EvaluateResumeDto): Promise<Evaluation> {
    const candidate = await this.candidatesRepository.findById(dto.candidateId);
    if (!candidate) {
      throw new NotFoundException(`Candidato com ID '${dto.candidateId}' não foi encontrado.`);
    }

    const job = await this.jobsRepository.findById(dto.jobId);
    if (!job) {
      throw new NotFoundException(`Vaga com ID '${dto.jobId}' não foi encontrada.`);
    }

    let targetResume: Resume | null = null;
    if (dto.resumeId) {
      targetResume = await this.resumesRepository.findById(dto.resumeId);
    } else {
      const candidateResumes = await this.resumesRepository.findByCandidateAndJob(
        dto.candidateId,
        dto.jobId,
      );
      targetResume = candidateResumes.find((r: Resume) => r.isActive) ?? candidateResumes[0];
    }

    if (!targetResume || !targetResume.extractedText || targetResume.extractedText.trim().length === 0) {
      throw new BadRequestException(
        'Nenhum currículo válido com texto extraído foi encontrado para este candidato nesta vaga.',
      );
    }

    const aiResult = await this.aiEvaluator.evaluate({
      candidateId: candidate.id,
      jobId: job.id,
      resumeId: targetResume.id,
      jobTitle: job.title,
      jobDescription: job.description,
      requirements: job.requirements,
      desiredSkills: job.desiredSkills,
      experienceLevel: job.experienceLevel,
      educationWeight: job.educationWeight,
      automationWeight: job.automationWeight,
      dataWeight: job.dataWeight,
      experienceWeight: job.experienceWeight,
      technologyWeight: job.technologyWeight,
      behavioralWeight: job.behavioralWeight,
      resumeText: targetResume.extractedText,
    });

    const evaluation = await this.screeningRepository.create({
      candidateId: candidate.id,
      jobId: job.id,
      resumeId: targetResume.id,
      educationScore: aiResult.scores.education,
      automationScore: aiResult.scores.automation,
      dataScore: aiResult.scores.data,
      experienceScore: aiResult.scores.experience,
      technologyScore: aiResult.scores.technology,
      behavioralScore: aiResult.scores.behavioral,
      finalScore: aiResult.finalScore,
      strengths: aiResult.strengths,
      gaps: aiResult.gaps,
      justification: aiResult.justification,
      recommendation: aiResult.recommendation as Recommendation,
      promptVersion: aiResult.promptVersion,
      aiModel: aiResult.aiModel,
      rawAiResponse: aiResult.rawResponse,
    });

    if (aiResult.recommendation === 'APPROVED') {
      await this.candidatesRepository.updateStatus(
        candidate.id,
        CandidateStatus.SCREENING_APPROVED,
      );
    }

    return evaluation;
  }
}
