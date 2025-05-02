import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DocumentQueryService } from '../document/document-query.service';
import { BotService } from '../bot/bot.service';
import { ModelService } from '../model/model.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly llmApiEndpoint: string;
  private readonly llmApiKey: string;

  constructor(
    private configService: ConfigService,
    private documentQueryService: DocumentQueryService,
    private botService: BotService,
    private modelService: ModelService,
  ) {
    this.llmApiEndpoint =
      this.configService.get<string>('AI_HUB_URL') || 'https://api.openai.com/v1/chat/completions';
    this.llmApiKey = 'sk-1234';
  }

  /**
   * Tạo phản hồi chat với hỗ trợ tùy chọn RAG
   */
  async generateChatResponse(
    botId: number,
    query: string,
    useRAG = true,
    temperature?: number,
    maxTokens?: number,
  ): Promise<any> {
    try {
      this.logger.log(`Tạo phản hồi chat cho query: "${query}", useRAG: ${useRAG}`);

      // Lấy thông tin về bot và model của bot
      const { bot, modelInfo } = await this.botService.getBotWithModelInfo(botId);

      if (!bot) {
        throw new NotFoundException(`Bot với ID ${botId} không tồn tại`);
      }

      this.logger.log(`Sử dụng bot: ${bot.name}, model: ${bot.modelName || 'không có'}`);

      // Nếu sử dụng RAG, lấy ngữ cảnh từ tài liệu
      let context = '';
      let sources = [];

      if (useRAG) {
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
      }

      // Tạo prompt dựa trên bot.prompt hoặc mặc định
      const prompt = this.createPrompt(query, context, bot);

      // Gọi LLM API để lấy phản hồi, sử dụng thông tin model từ bot
      const answer = await this.queryLLM(prompt, bot, modelInfo, temperature, maxTokens);

      return {
        answer,
        query,
        useRAG,
        sources: useRAG ? sources : [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo phản hồi chat: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tạo prompt dựa trên có hay không có context và cấu hình bot
   */
  private createPrompt(query: string, context?: string, bot?: any): string {
    // Nếu bot có prompt tùy chỉnh và không rỗng, sử dụng nó
    if (bot && bot.prompt && bot.prompt.trim()) {
      let customPrompt = bot.prompt;

      // Thay thế placeholders nếu có
      if (context && context.trim()) {
        customPrompt = customPrompt.replace('{context}', context);
      }

      customPrompt = customPrompt.replace('{query}', query);

      return customPrompt;
    }

    // Nếu không có prompt tùy chỉnh, sử dụng mẫu mặc định
    if (context && context.trim()) {
      // Prompt với RAG
      return `
Bạn là một trợ lí AI hữu ích và chuyên nghiệp.
Dưới đây là một số thông tin có thể liên quan đến câu hỏi:

---CONTEXT---
${context}
---END OF CONTEXT---

Dựa trên thông tin trên (nếu liên quan) và kiến thức của bạn, hãy trả lời câu hỏi sau một cách chính xác, đầy đủ và hữu ích.
Nếu thông tin trong context không đủ, hãy trả lời dựa trên kiến thức của bạn.

Câu hỏi: ${query}

Trả lời:
`;
    } else {
      // Prompt không có RAG
      return `
Bạn là một trợ lí AI hữu ích và chuyên nghiệp.
Hãy trả lời câu hỏi sau một cách chính xác, đầy đủ và hữu ích.

Câu hỏi: ${query}

Trả lời:
`;
    }
  }

  /**
   * Gửi prompt đến LLM API và nhận về câu trả lời
   * Sử dụng thông tin model từ bot và modelInfo để định cấu hình yêu cầu API
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
