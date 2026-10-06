import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetJobRankingUseCase } from '../../application/use-cases/get-job-ranking.use-case';
import { GetCandidateRankingPositionUseCase } from '../../application/use-cases/get-candidate-ranking-position.use-case';

@ApiTags('ranking')
@Controller('api/v1')
export class RankingController {
  constructor(
    private readonly getJobRankingUseCase: GetJobRankingUseCase,
    private readonly getCandidateRankingPositionUseCase: GetCandidateRankingPositionUseCase,
  ) {}

  @Get('jobs/:jobId/ranking')
  @ApiOperation({
    summary: 'Obter o ranking completo de candidatos de uma vaga',
    description:
      'Retorna todos os candidatos classificados por finalScore = resumeScore × rankingResumeWeight + testScore × rankingTestWeight. Candidatos sem teste têm apenas o resumeScore considerado.',
  })
  @ApiParam({ name: 'jobId', description: 'UUID da vaga' })
  @ApiResponse({ status: 200, description: 'Ranking calculado com sucesso' })
  @ApiResponse({ status: 404, description: 'Vaga não encontrada' })
  async getJobRanking(@Param('jobId') jobId: string) {
    return this.getJobRankingUseCase.execute(jobId);
  }

  @Get('jobs/:jobId/ranking/:candidateId')
  @ApiOperation({ summary: 'Obter a posição de um candidato específico no ranking de uma vaga' })
  @ApiParam({ name: 'jobId', description: 'UUID da vaga' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Posição do candidato no ranking' })
  @ApiResponse({ status: 404, description: 'Vaga ou candidato não encontrado' })
  async getCandidatePosition(
    @Param('jobId') jobId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.getCandidateRankingPositionUseCase.execute(jobId, candidateId);
  }
}
