import { Body, Controller, Post, Logger } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(
    @Body()
    chatRequest: {
      botId: number;
      query: string;
      useRAG?: boolean;
      temperature?: number;
      maxTokens?: number;
    },
  ) {
    this.logger.log(
      `Nhận yêu cầu chat cho botId: ${chatRequest.botId}, query: "${chatRequest.query}", useRAG: ${
        chatRequest.useRAG ? 'true' : 'false'
      }`,
    );

    return this.chatService.generateChatResponse(
      chatRequest.botId,
      chatRequest.query,
      chatRequest.useRAG ?? true,
      chatRequest.temperature,
      chatRequest.maxTokens,
    );
  }
}
