import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RankingController } from './ranking.controller';

describe('RankingController', () => {
  let controller: RankingController;
  let mockGetJobRanking: any;
  let mockGetCandidatePosition: any;

  beforeEach(() => {
    mockGetJobRanking = {
      execute: vi.fn().mockResolvedValue([
        {
          candidateId: 'cand-1',
          rankingPosition: 1,
          finalScore: 9.40,
          resumeScore: 9.0,
          testScore: 10.0,
        },
      ]),
    };
    mockGetCandidatePosition = {
      execute: vi.fn().mockResolvedValue({
        candidateId: 'cand-1',
        rankingPosition: 1,
        finalScore: 9.40,
      }),
    };

    controller = new RankingController(mockGetJobRanking, mockGetCandidatePosition);
  });

  it('deve chamar getJobRankingUseCase no GET /jobs/:jobId/ranking', async () => {
    const res = await controller.getJobRanking('job-1');
    expect(mockGetJobRanking.execute).toHaveBeenCalledWith('job-1');
    expect(res[0].rankingPosition).toBe(1);
    expect(res[0].finalScore).toBe(9.40);
  });

  it('deve chamar getCandidateRankingPositionUseCase no GET /jobs/:jobId/ranking/:candidateId', async () => {
    const res = await controller.getCandidatePosition('job-1', 'cand-1');
    expect(mockGetCandidatePosition.execute).toHaveBeenCalledWith('job-1', 'cand-1');
    expect(res.rankingPosition).toBe(1);
  });
});
