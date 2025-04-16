import { Body, Controller, Post, Logger } from '@nestjs/common';
import { DocumentQueryService } from './document-query.service';

@Controller('documents/query')
export class DocumentQueryController {
  private readonly logger = new Logger(DocumentQueryController.name);

  constructor(private readonly documentQueryService: DocumentQueryService) {}

  @Post()
  async queryDocuments(@Body() queryDto: { 
    botId: number;
    query: string;
    maxResults?: number;
  }) {
    this.logger.log(`Nhận câu hỏi: "${queryDto.query}" cho botId: ${queryDto.botId}`);
    return this.documentQueryService.queryDocuments(
      queryDto.query,
      queryDto.botId,
      queryDto.maxResults
    );
  }
}