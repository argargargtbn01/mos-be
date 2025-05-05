import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DocumentQueryService } from '../document/document-query.service';
import { BotService } from '../bot/bot.service';
import { ModelService } from '../model/model.service';
import { v4 as uuidv4 } from 'uuid';

// Định nghĩa cấu trúc cho một tin nhắn
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Định nghĩa cấu trúc cho một cuộc trò chuyện
interface ChatSession {
  botId: number;
  messages: ChatMessage[];
  lastUpdated: Date;
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly llmApiEndpoint: string;
  private readonly llmApiKey: string;

  // Cache lưu trữ các cuộc hội thoại theo chatId
  private chatSessionsCache: Map<string, ChatSession> = new Map<string, ChatSession>();

  constructor(
    private configService: ConfigService,
    private documentQueryService: DocumentQueryService,
    private botService: BotService,
    private modelService: ModelService,
  ) {
    this.llmApiEndpoint =
      this.configService.get<string>('AI_HUB_URL') || 'https://api.openai.com/v1/chat/completions';
    this.llmApiKey = 'sk-1234';

    // Thiết lập interval để dọn dẹp các phiên chat cũ (sau 24 giờ không hoạt động)
    setInterval(() => this.cleanupOldSessions(), 3600000); // Chạy mỗi giờ
  }

  /**
   * Tạo phản hồi chat với hỗ trợ tùy chọn RAG và lịch sử trò chuyện
   */
  async generateChatResponse(
    botId: number,
    query: string,
    useRAG = true,
    temperature?: number,
    maxTokens?: number,
    chatId?: string,
  ): Promise<any> {
    try {
      this.logger.log(
        `Tạo phản hồi chat cho query: "${query}", useRAG: ${useRAG}, chatId: ${chatId || 'new'}`,
      );

      // Tìm hoặc tạo phiên chat mới
      let chatSession: ChatSession;
      if (chatId && this.chatSessionsCache.has(chatId)) {
        chatSession = this.chatSessionsCache.get(chatId);
        chatSession.lastUpdated = new Date();
        this.logger.log(`Sử dụng phiên chat hiện có với chatId: ${chatId}, số tin nhắn hiện có: ${chatSession.messages.length}`);
      } else {
        const newChatId = uuidv4();
        chatSession = {
          botId: botId,
          messages: [],
          lastUpdated: new Date(),
        };
        this.chatSessionsCache.set(newChatId, chatSession);
        chatId = newChatId;
        this.logger.log(`Tạo phiên chat mới với chatId: ${chatId}`);
      }

      // Lấy thông tin về bot và model của bot
      const { bot, modelInfo } = await this.botService.getBotWithModelInfo(botId);

      if (!bot) {
        throw new NotFoundException(`Bot với ID ${botId} không tồn tại`);
      }

      this.logger.log(`Sử dụng bot: ${bot.name}, model: ${bot.modelName || 'không có'}`);

      // Thêm tin nhắn người dùng vào lịch sử
      const userMessage: ChatMessage = {
        role: 'user',
        content: query,
        timestamp: new Date(),
      };
      chatSession.messages.push(userMessage);

      // Nếu sử dụng RAG, lấy ngữ cảnh từ tài liệu
      let context = '';
      let sources = [];

      if (useRAG) {
        this.logger.log(`RAG được kích hoạt cho câu hỏi: "${query}"`);
        try {
          this.logger.log(
            `Gọi DocumentQueryService.queryDocuments() cho query: "${query}", botId: ${botId}`,
          );
          const ragResponse = await this.documentQueryService.queryDocuments(query, botId);

          this.logger.log(
            `Nhận được phản hồi từ DocumentQueryService: ${JSON.stringify({
              answer: ragResponse.answer ? ragResponse.answer.substring(0, 50) + '...' : 'N/A',
              hasError: !!ragResponse.error,
              hasSources: !!(ragResponse.sources && ragResponse.sources.length > 0),
              sourceCount: ragResponse.sources?.length || 0,
            })}`,
          );

          if (ragResponse.sources && ragResponse.sources.length > 0) {
            context = ragResponse.sources.map((source) => source.textPreview || '').join('\n\n');
            this.logger.log(
              `Đã tạo context từ ${ragResponse.sources.length} sources, độ dài: ${context.length} ký tự`,
            );
            this.logger.log(
              `Context preview: ${context.substring(0, 200)}${context.length > 200 ? '...' : ''}`,
            );
            sources = ragResponse.sources;
          } else {
            this.logger.warn(`Không có sources nhận được từ DocumentQueryService`);
          }
        } catch (error) {
          this.logger.warn(
            `Không thể lấy ngữ cảnh RAG: ${error.message}. Tiếp tục mà không có RAG.`,
          );
        }
      } else {
        this.logger.log(`RAG không được kích hoạt cho câu hỏi này`);
      }

      // Xây dựng lịch sử trò chuyện cho prompt
      const conversationHistory = this.buildConversationHistory(chatSession.messages);

      // Tạo prompt dựa trên bot.prompt hoặc mặc định, kèm lịch sử
      const prompt = this.createPrompt(query, context, bot, conversationHistory);

      // Log prompt đầy đủ để debug
      this.logger.log(`Prompt đầy đủ gửi đến LLM:\n${prompt}`);

      // Gọi LLM API để lấy phản hồi, sử dụng thông tin model từ bot
      const answer = await this.queryLLM(prompt, bot, modelInfo, temperature, maxTokens);

      // Thêm phản hồi của bot vào lịch sử
      const botMessage: ChatMessage = {
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      chatSession.messages.push(botMessage);

      return {
        answer,
        query,
        useRAG,
        sources: useRAG ? sources : [],
        timestamp: new Date().toISOString(),
        chatId: chatId,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo phản hồi chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Xây dựng lịch sử trò chuyện từ các tin nhắn
   */
  private buildConversationHistory(messages: ChatMessage[]): string {
    // Log số lượng tin nhắn nhận được
    this.logger.log(`buildConversationHistory: Tổng số tin nhắn: ${messages.length}`);

    // Nếu không có tin nhắn hoặc chỉ có 1 tin nhắn (tin nhắn hiện tại), không có lịch sử
    if (messages.length <= 1) {
      this.logger.log(
        'buildConversationHistory: Không có lịch sử trò chuyện (chỉ có tin nhắn hiện tại)',
      );
      return '';
    }

    // Sử dụng tất cả tin nhắn cho lịch sử, bao gồm cả câu hỏi hiện tại
    // Điều này đảm bảo lịch sử đầy đủ hơn và giúp mô hình có thêm ngữ cảnh
    const historyMessages = messages;

    this.logger.log(`buildConversationHistory: Số tin nhắn lịch sử: ${historyMessages.length}`);

    // Format lịch sử trò chuyện
    let history = '---CHAT HISTORY---\n';

    historyMessages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'Người dùng' : 'Trợ lý';
      history += `${role}: ${msg.content}\n\n`;
    });

    history += '---END OF CHAT HISTORY---\n\n';

    this.logger.log(
      `buildConversationHistory: Đã tạo lịch sử trò chuyện với ${historyMessages.length} tin nhắn`,
    );
    // Log toàn bộ lịch sử không cần substring
    this.logger.log(`buildConversationHistory: History full:\n${history}`);

    return history;
  }

  /**
   * Dọn dẹp các phiên chat cũ không hoạt động sau 24 giờ
   */
  private cleanupOldSessions(): void {
    const now = new Date();
    const expiredTime = 24 * 60 * 60 * 1000; // 24 giờ tính bằng mili giây

    this.chatSessionsCache.forEach((session, chatId) => {
      if (now.getTime() - session.lastUpdated.getTime() > expiredTime) {
        this.chatSessionsCache.delete(chatId);
        this.logger.log(`Đã xóa phiên chat ${chatId} do không hoạt động trong 24 giờ`);
      }
    });
  }

  /**
   * Tạo prompt dựa trên có hay không có context và cấu hình bot
   */
  private createPrompt(
    query: string,
    context?: string,
    bot?: any,
    conversationHistory?: string,
  ): string {
    // Nếu bot có prompt tùy chỉnh và không rỗng, sử dụng nó
    if (bot && bot.prompt && bot.prompt.trim()) {
      let customPrompt = bot.prompt;

      // Thay thế placeholders nếu có
      if (context && context.trim()) {
        customPrompt = customPrompt.replace('{context}', context);
      }

      if (conversationHistory && conversationHistory.trim()) {
        customPrompt = customPrompt.replace('{history}', conversationHistory);
      } else {
        // Xóa {history} nếu không có lịch sử
        customPrompt = customPrompt.replace('{history}', '');
      }

      customPrompt = customPrompt.replace('{query}', query);

      return customPrompt;
    }

    // Nếu không có prompt tùy chỉnh, sử dụng mẫu mặc định
    let defaultPrompt = `
Bạn là một trợ lí AI hữu ích và chuyên nghiệp.
`;

    // Thêm lịch sử trò chuyện nếu có
    if (conversationHistory && conversationHistory.trim()) {
      defaultPrompt += `
${conversationHistory}
`;
    }

    if (context && context.trim()) {
      // Prompt với RAG
      defaultPrompt += `
Dưới đây là một số thông tin có thể liên quan đến câu hỏi:

---CONTEXT---
${context}
---END OF CONTEXT---

Dựa trên thông tin trên (nếu liên quan) và kiến thức của bạn, hãy trả lời câu hỏi sau một cách chính xác, đầy đủ và hữu ích.
Nếu thông tin trong context không đủ, hãy trả lời dựa trên kiến thức của bạn.
`;
    } else {
      // Prompt không có RAG
      defaultPrompt += `
Hãy trả lời câu hỏi sau một cách chính xác, đầy đủ và hữu ích.
`;
    }

    defaultPrompt += `
Câu hỏi: ${query}

Trả lời:
`;

    return defaultPrompt;
  }

  /**
   * Gửi prompt đến LLM API và nhận về câu trả lời
   */
  private async queryLLM(
    prompt: string,
    bot?: any,
    modelInfo?: any,
    temperature = 0.7,
    maxTokens = 2000,
  ): Promise<string> {
    try {
      // Sử dụng cài đặt từ bot nếu có
      const modelTemp = bot?.configurations?.temperature || temperature;
      const modelMaxTokens = bot?.configurations?.maxTokens || maxTokens;

      // Lấy model name từ bot hoặc fallback vào default
      const modelName = bot?.modelName || 'gemini/gemini-2.0-pro-exp-02-05';

      this.logger.log(
        `Gọi API với model: ${modelName}, temperature: ${modelTemp}, maxTokens: ${modelMaxTokens}`,
      );

      // Gọi API dựa vào endpoint được cấu hình
      if (
        this.llmApiEndpoint.includes('openai.com') ||
        (modelInfo && modelInfo.litellm_params?.custom_llm_provider === 'openai')
      ) {
        // OpenAI API
        const response = await axios.post(
          this.llmApiEndpoint,
          {
            model: modelName.includes('gpt') ? modelName : 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: modelTemp || 0.7,
            max_tokens: modelMaxTokens || 2000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.llmApiKey}`,
            },
          },
        );

        return response.data['choices'][0].message.content;
      }
      // Hỗ trợ Gemini API và các API khác từ ModelInfo
      else {
        const useGemini =
          modelName.includes('gemini') ||
          (modelInfo && modelInfo.litellm_params?.custom_llm_provider === 'google');

        const apiModel =
          modelName || (useGemini ? 'gemini/gemini-2.0-pro-exp-02-05' : modelInfo?.model_name);

        this.logger.log(`Sử dụng model API: ${apiModel}`);

        const response = await axios.post(
          this.llmApiEndpoint,
          {
            model: apiModel,
            messages: [
              {
                role: 'system',
                content: 'Bạn là một trợ lí AI hữu ích và chuyên nghiệp.',
              },
              {
                role: 'user',
                content: prompt,
              },
            ],
            temperature: modelTemp || 0.7,
            max_tokens: modelMaxTokens || 2000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.llmApiKey}`,
            },
          },
        );

        return response.data['choices'][0].message.content;
      }
    } catch (error) {
      this.logger.error(`Lỗi khi gọi LLM API: ${error.message}`);
      return `Lỗi khi kết nối với language model: ${error.message}`;
    }
  }
}
