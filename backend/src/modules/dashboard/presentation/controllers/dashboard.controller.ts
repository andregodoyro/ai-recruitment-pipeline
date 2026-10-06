import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDashboardOverviewUseCase } from '../../application/use-cases/get-dashboard-overview.use-case';
import { DashboardFilterDto } from '../../application/dtos/dashboard-filter.dto';

@ApiTags('dashboard')
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private readonly getDashboardOverviewUseCase: GetDashboardOverviewUseCase) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Obter visão geral do dashboard analítico de recrutamento',
    description:
      'Retorna métricas gerais, contagem do funil de candidatos, distribuição de notas (histograma de scores) e os top candidatos com ranking ponderado.',
  })
  @ApiResponse({ status: 200, description: 'Dados do dashboard obtidos com sucesso' })
  @ApiResponse({ status: 404, description: 'Vaga especificada no filtro não encontrada' })
  async getOverview(@Query() filter: DashboardFilterDto) {
    return this.getDashboardOverviewUseCase.execute(filter);
  }
}
