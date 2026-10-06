import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message: string | string[] = 'Erro interno do servidor';
    let error: string = 'Internal Server Error';

    if (exceptionResponse) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const respObj = exceptionResponse as Record<string, any>;
        message = respObj.message ?? message;
        error = respObj.error ?? error;
      }
    } else if (exception instanceof Error) {
      // Em modo de produção, não expor stack traces ou mensagens internas não tratadas
      const isProduction = process.env.NODE_ENV === 'production';
      message = isProduction
        ? 'Ocorreu um erro interno ao processar a solicitação.'
        : exception.message;
    }

    const errorBody = {
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} - Status ${status} - Error: ${
          exception instanceof Error ? exception.stack : JSON.stringify(exception)
        }`,
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - Status ${status} - Message: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(errorBody);
  }
}
