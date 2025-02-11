import { Module } from '@nestjs/common';
import { BotApiKeyService } from './bot-api-key.service';
import { BotApiKeyController } from './bot-api-key.controller';

@Module({
  controllers: [BotApiKeyController],
  providers: [BotApiKeyService],
})
export class BotApiKeyModule {}
