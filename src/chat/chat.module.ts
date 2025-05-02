import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DocumentModule } from '../document/document.module';
import { BotModule } from '../bot/bot.module';
import { ModelModule } from '../model/model.module';

@Module({
  imports: [
    DocumentModule, // Import DocumentModule để sử dụng DocumentQueryService
    BotModule, // Import BotModule để sử dụng BotService
    ModelModule, // Import ModelModule để sử dụng ModelService
  ],
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
