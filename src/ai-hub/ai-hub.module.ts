import { Module } from '@nestjs/common';
import { AIHubService } from './ai-hub.service';

@Module({
  providers: [AIHubService],
  exports: [AIHubService],
})
export class AiHubModule {}
