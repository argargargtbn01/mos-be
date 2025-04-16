import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface VectorSearchResult {
  id: string;
  documentId: string;
  botId: number;
  filename: string;
  text: string;
  score: number;
  metadata?: any;
}

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private readonly dataHubUrl: string;
  private readonly llmApiUrl: string;
  private readonly llmApiKey: string;

  constructor(private configService: ConfigService) {
    this.dataHubUrl = this.configService.get<string>('DATA_HUB_URL') || 'localhost:3002';
    this.llmApiUrl = this.configService.get<string>('LLM_API_URL');
    this.llmApiKey = this.configService.get<string>('LLM_API_KEY');
  }

  async generateRagResponse(botId: number, query: string, history: any[] = []): Promise<string> {
    try {
      this.logger.log(`Generating RAG response for botId: ${botId}, query: ${query}`);
      
      // 1. Gọi data-hub để lấy ngữ cảnh đã chuẩn bị từ các tài liệu liên quan
      const context = await this.getContextFromDataHub(botId, query);
      
      // 2. Gửi câu hỏi và ngữ cảnh tới LLM để sinh câu trả lời
      return this.generateLlmResponse(query, context, history);
    } catch (error) {
      this.logger.error(`Error generating RAG response: ${error.message}`);
      throw error;
    }
  }

  private async getContextFromDataHub(botId: number, query: string): Promise<string> {
    try {
      this.logger.log(`Getting prepared context from data-hub for botId: ${botId}, query: ${query}`);
      
      const response = await axios.post(`${this.dataHubUrl}/retrieval/prepare-context`, {
        botId,
        query,
        k: 5, // Số lượng tài liệu tối đa
      });
      
      if (response.data && response.data['context']) {
        return response.data['context'];
      }
      
      this.logger.warn(`No context received from data-hub for query: ${query}`);
      return '';
    } catch (error) {
      this.logger.error(`Error getting context from data-hub: ${error.message}`);
      return ''; // Trả về chuỗi rỗng nếu có lỗi để LLM có thể hoạt động mà không có ngữ cảnh
    }
  }

  private async generateLlmResponse(query: string, context: string, history: any[]): Promise<string> {
    try {
      // Tạo prompt cho LLM, kết hợp context với query
      let prompt = '';
      
      if (context) {
        prompt = `Sử dụng thông tin sau đây để trả lời câu hỏi:
        
${context}

Câu hỏi: ${query}

Trả lời dựa trên thông tin được cung cấp. Nếu không tìm thấy thông tin để trả lời, hãy nói rằng bạn không có đủ thông tin.`;
      } else {
        prompt = `Câu hỏi: ${query}\n\nHãy trả lời dựa trên kiến thức của bạn.`;
      }
      
      // Gửi yêu cầu đến LLM API
      const response = await axios.post(
        this.llmApiUrl,
        {
          model: 'gpt-4', // hoặc model khác tùy cấu hình
          messages: [
            ...history,
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.llmApiKey}`,
          },
        },
      );
      
      return response.data['choices'][0].message.content;
    } catch (error) {
      this.logger.error(`Error generating LLM response: ${error.message}`);
      throw error;
    }
  }
}