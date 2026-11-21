import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentQueryService } from '../document/document-query.service';
import { BotService } from '../bot/bot.service';
import { AIHubService } from '../ai-hub/ai-hub.service';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  botId: number;
  messages: ChatMessage[];
  lastUpdated: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly chatSessionsCache = new Map<string, ChatSession>();

  constructor(
    private readonly documentQueryService: DocumentQueryService,
    private readonly botService: BotService,
    private readonly aiHubService: AIHubService,
  ) {
    setInterval(() => this.cleanupOldSessions(), 3600000);
  }

  async generateChatResponse(
    botId: number,
    query: string,
    useRAG = true,
    temperature?: number,
    maxTokens?: number,
    chatId?: string,
  ): Promise<any> {
    const { bot, modelInfo } = await this.botService.getBotWithModelInfo(botId);
    if (!bot) {
      throw new NotFoundException(`Bot với ID ${botId} không tồn tại`);
    }

    const sessionId = chatId && this.chatSessionsCache.has(chatId) ? chatId : uuidv4();
    const chatSession = this.chatSessionsCache.get(sessionId) || {
      botId,
      messages: [],
      lastUpdated: new Date(),
    };
    chatSession.lastUpdated = new Date();
    chatSession.messages.push({ role: 'user', content: query, timestamp: new Date() });
    this.chatSessionsCache.set(sessionId, chatSession);

    let context = '';
    let sources: any[] = [];

    if (useRAG) {
      try {
        const ragResponse = await this.documentQueryService.queryDocuments(query, botId);
        sources = ragResponse.sources || [];
        context = sources.map((source) => source.textPreview || '').join('\n\n');
      } catch (error) {
        this.logger.warn(`Không thể lấy ngữ cảnh RAG: ${error.message}`);
      }
    }

    const prompt = this.createPrompt(query, context, bot, this.buildConversationHistory(chatSession.messages));
    const answer = await this.queryLLM(prompt, bot, modelInfo, temperature, maxTokens);

    chatSession.messages.push({ role: 'assistant', content: answer, timestamp: new Date() });
    return {
      answer,
      query,
      useRAG,
      sources: useRAG ? sources : [],
      timestamp: new Date().toISOString(),
      chatId: sessionId,
    };
  }

  private buildConversationHistory(messages: ChatMessage[]): string {
    if (messages.length <= 1) {
      return '';
    }

    return (
      '---CHAT HISTORY---\n' +
      messages
        .map((message) => `${message.role === 'user' ? 'Người dùng' : 'Trợ lý'}: ${message.content}`)
        .join('\n\n') +
      '\n---END OF CHAT HISTORY---\n\n'
    );
  }

  private createPrompt(
    query: string,
    context: string,
    bot: any,
    conversationHistory: string,
  ): string {
    if (bot?.prompt?.trim()) {
      return bot.prompt
        .replace('{context}', context)
        .replace('{history}', conversationHistory)
        .replace('{query}', query);
    }

    const contextSection = context
      ? `\nDưới đây là một số thông tin có thể liên quan:\n\n---CONTEXT---\n${context}\n---END OF CONTEXT---\n`
      : '';

    return `Bạn là một trợ lí AI hữu ích và chuyên nghiệp.\n${conversationHistory}${contextSection}\nHãy trả lời câu hỏi sau một cách chính xác, đầy đủ và hữu ích.\n\nCâu hỏi: ${query}\n\nTrả lời:\n`;
  }

  private async queryLLM(
    prompt: string,
    bot?: any,
    modelInfo?: any,
    temperature = 0.7,
    maxTokens = 2000,
  ): Promise<string> {
    try {
      const modelTemp = bot?.configurations?.temperature ?? temperature;
      const modelMaxTokens = bot?.configurations?.maxTokens ?? maxTokens;
      const modelId = bot?.modelName || modelInfo?.litellm_params?.model;

      return await this.aiHubService.generateText(prompt, {
        modelId,
        temperature: modelTemp,
        maxTokens: modelMaxTokens,
      });
    } catch (error) {
      this.logger.error(`Lỗi khi gọi AWS Bedrock: ${error.message}`);
      return `Lỗi khi kết nối với language model: ${error.message}`;
    }
  }

  private cleanupOldSessions(): void {
    const expiry = Date.now() - 24 * 60 * 60 * 1000;
    this.chatSessionsCache.forEach((session, sessionId) => {
      if (session.lastUpdated.getTime() < expiry) {
        this.chatSessionsCache.delete(sessionId);
      }
    });
  }
}
