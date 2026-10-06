import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardController } from './dashboard.controller';

describe('DashboardController', () => {
  let controller: DashboardController;
  let mockUseCase: any;

  beforeEach(() => {
    mockUseCase = {
      execute: vi.fn().mockResolvedValue({
        metrics: { totalJobs: 1 },
        funnel: [],
        scoreDistribution: [],
        topCandidates: [],
      }),
    };

    controller = new DashboardController(mockUseCase);
  });

  it('deve chamar GetDashboardOverviewUseCase com os filtros informados', async () => {
    const filter = { jobId: 'job-1' };
    const res = await controller.getOverview(filter);

    expect(res).toBeDefined();
    expect(res.metrics.totalJobs).toBe(1);
    expect(mockUseCase.execute).toHaveBeenCalledWith(filter);
  });
});
