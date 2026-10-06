export const TEXT_EXTRACTOR = 'TEXT_EXTRACTOR';

export interface ITextExtractor {
  extractText(buffer: Buffer, mimeType: string): Promise<string>;
}
