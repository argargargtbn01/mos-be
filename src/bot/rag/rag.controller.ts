import { Body, Controller, Post, Param } from '@nestjs/common';
import { RagService } from './rag.service';

interface RagQueryDto {
  query: string;
  history?: any[];
}

@Controller('bot/:botId/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post()
  async generateRagResponse(
    @Param('botId') botId: number,
    @Body() dto: RagQueryDto,
  ): Promise<{ answer: string }> {
    const answer = await this.ragService.generateRagResponse(
      botId,
      dto.query,
      dto.history || [],
    );
    return { answer };
  }
}