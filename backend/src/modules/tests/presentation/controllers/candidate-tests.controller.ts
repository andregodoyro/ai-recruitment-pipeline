import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { AssignTestUseCase } from '../../application/use-cases/assign-test.use-case';
import { SubmitAnswersUseCase } from '../../application/use-cases/submit-answers.use-case';
import { GetCandidateTestUseCase } from '../../application/use-cases/get-candidate-test.use-case';
import { SubmitAnswersDto } from '../../application/dtos/submit-answers.dto';
import {
  ICandidateTestsRepository,
  CANDIDATE_TESTS_REPOSITORY,
} from '../../domain/candidate-tests.repository.interface';
import { Inject } from '@nestjs/common';

@ApiTags('candidate-tests')
@Controller('api/v1')
export class CandidateTestsController {
  constructor(
    private readonly assignTestUseCase: AssignTestUseCase,
    private readonly submitAnswersUseCase: SubmitAnswersUseCase,
    private readonly getCandidateTestUseCase: GetCandidateTestUseCase,
    @Inject(CANDIDATE_TESTS_REPOSITORY)
    private readonly candidateTestsRepository: ICandidateTestsRepository,
  ) {}

  @Post('tests/:testId/assign/:candidateId')
  @ApiOperation({ summary: 'Atribuir um teste publicado a um candidato' })
  @ApiParam({ name: 'testId', description: 'UUID do teste' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 201, description: 'Teste atribuído ao candidato' })
  @ApiResponse({ status: 400, description: 'Teste não está publicado' })
  @ApiResponse({ status: 404, description: 'Teste ou candidato não encontrado' })
  @ApiResponse({ status: 409, description: 'Teste já atribuído ao candidato' })
  async assign(
    @Param('testId') testId: string,
    @Param('candidateId') candidateId: string,
  ) {
    return this.assignTestUseCase.execute(testId, candidateId);
  }

  @Get('candidate-tests/:id')
  @ApiOperation({ summary: 'Obter detalhes e respostas de uma aplicação de teste' })
  @ApiParam({ name: 'id', description: 'UUID da aplicação do teste (CandidateTest)' })
  @ApiResponse({ status: 200, description: 'Detalhes da aplicação do teste' })
  @ApiResponse({ status: 404, description: 'Aplicação não encontrada' })
  async findOne(@Param('id') id: string) {
    return this.getCandidateTestUseCase.execute(id);
  }

  @Post('candidate-tests/:id/submit')
  @ApiOperation({ summary: 'Submeter respostas, corrigir questões objetivas e calcular score' })
  @ApiParam({ name: 'id', description: 'UUID da aplicação do teste' })
  @ApiResponse({ status: 200, description: 'Respostas submetidas e teste corrigido com sucesso' })
  @ApiResponse({ status: 400, description: 'Teste já submetido anteriormente' })
  @ApiResponse({ status: 404, description: 'Aplicação não encontrada' })
  async submit(
    @Param('id') id: string,
    @Body() dto: SubmitAnswersDto,
  ) {
    return this.submitAnswersUseCase.execute(id, dto);
  }

  @Get('candidates/:candidateId/tests')
  @ApiOperation({ summary: 'Listar todos os testes atribuídos a um candidato' })
  @ApiParam({ name: 'candidateId', description: 'UUID do candidato' })
  @ApiResponse({ status: 200, description: 'Lista de testes do candidato' })
  async findByCandidate(@Param('candidateId') candidateId: string) {
    return this.candidateTestsRepository.findByCandidateId(candidateId);
  }
}
