import { describe, it, expect, vi } from 'vitest';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/api/v1/test',
      method: 'GET',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('deve formatar adequadamente uma HttpException padrão', () => {
    const exception = new HttpException('Recurso não encontrado', HttpStatus.NOT_FOUND);

    filter.catch(exception, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'Recurso não encontrado',
        path: '/api/v1/test',
      }),
    );
  });

  it('deve mascarar erros não tratados como 500 sem vazar stack trace', () => {
    const error = new Error('Database password leak: postgres123');

    filter.catch(error, mockHost);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        error: 'Internal Server Error',
        path: '/api/v1/test',
      }),
    );
  });
});
