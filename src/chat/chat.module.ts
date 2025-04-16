import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [DocumentModule], // Import DocumentModule để sử dụng DocumentQueryService
  controllers: [ChatController],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}
