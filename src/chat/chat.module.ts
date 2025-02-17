import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { DocumentChunk } from 'src/shared/entities/document-chunk.entity';
import { Message } from 'src/message/entities/message.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, DocumentChunk, Message])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
