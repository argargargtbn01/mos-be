import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DocumentQueryService } from '../document/document-query.service';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly llmApiEndpoint: string;
  private readonly llmApiKey: string;

  constructor(
    private configService: ConfigService,
    private documentQueryService: DocumentQueryService,
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

      // Nếu sử dụng RAG, lấy ngữ cảnh từ tài liệu
      let context = '';
      let sources = [];

      if (useRAG) {
        try {
          const ragResponse = await this.documentQueryService.queryDocuments(query, botId);
          if (ragResponse.sources && ragResponse.sources.length > 0) {
            context = ragResponse.sources.map((source) => source.textPreview || '').join('\n\n');
            sources = ragResponse.sources;
          }
        } catch (error) {
          this.logger.warn(
            `Không thể lấy ngữ cảnh RAG: ${error.message}. Tiếp tục mà không có RAG.`,
          );
        }
      }

      // Tạo prompt phù hợp dựa vào việc có context từ RAG hay không
      const prompt = this.createPrompt(query, context);

      // Gọi LLM API để lấy phản hồi
      const answer = await this.queryLLM(prompt, temperature, maxTokens);

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
   * Tạo prompt dựa trên có hay không có context
   */
  private createPrompt(query: string, context?: string): string {
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
   */
  private async queryLLM(prompt: string, temperature = 0.7, maxTokens = 2000): Promise<string> {
    try {
      // Kiểm tra API key
      if (!this.llmApiKey) {
        this.logger.warn('Chưa cấu hình API key cho LLM');
        return 'Không thể kết nối với language model vì thiếu API key.';
      }

      // Gọi API dựa vào endpoint được cấu hình
      if (this.llmApiEndpoint.includes('openai.com')) {
        // OpenAI API
        const response = await axios.post(
          this.llmApiEndpoint,
          {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: temperature || 0.7,
            max_tokens: maxTokens || 2000,
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
      // Hỗ trợ Gemini API
      else if (this.llmApiEndpoint.includes('chat/completions')) {
        // Gemini API
        const response = await axios.post(
          this.llmApiEndpoint,
          {
            model: 'gemini/gemini-2.0-pro-exp-02-05', // Có thể cấu hình trong env
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
            temperature: temperature || 0.7,
            max_tokens: maxTokens || 2000,
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
      // Có thể mở rộng để hỗ trợ các API khác ở đây
      else {
        this.logger.warn(`API endpoint không được hỗ trợ: ${this.llmApiEndpoint}`);
        return 'API language model chưa được hỗ trợ. Vui lòng cấu hình LLM_API_ENDPOINT phù hợp.';
      }
    } catch (error) {
      this.logger.error(`Lỗi khi gọi LLM API: ${error.message}`);
      return `Lỗi khi kết nối với language model: ${error.message}`;
    }
  }
}
