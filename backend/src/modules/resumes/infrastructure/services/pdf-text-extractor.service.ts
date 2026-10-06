import { Injectable, Logger } from '@nestjs/common';
import { ITextExtractor } from '../../domain/services/text-extractor.interface';
// eslint-disable-next-ignore
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfTextExtractorService implements ITextExtractor {
  private readonly logger = new Logger(PdfTextExtractorService.name);

  async extractText(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'text/plain') {
      return buffer.toString('utf8');
    }

    try {
      const parseFunc = typeof pdfParse === 'function' ? pdfParse : pdfParse.default || pdfParse;
      const pdfData = await parseFunc(buffer);
      const extracted = pdfData.text ? pdfData.text.replace(/\r\n/g, '\n').trim() : '';
      this.logger.log(`📄 Texto extraído com sucesso (${extracted.length} caracteres).`);
      return extracted;
    } catch (error) {
      this.logger.warn(
        `⚠️ Falha ao extrair texto do arquivo (${mimeType}): ${(error as Error).message}`,
      );
      return '';
    }
  }
}
