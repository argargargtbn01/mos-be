import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DocumentQueryService {
  private readonly logger = new Logger(DocumentQueryService.name);
  private readonly dataHubUrl: string;

  constructor(private configService: ConfigService) {
    this.dataHubUrl = this.configService.get<string>('DATA_HUB_URL') || 'http://localhost:3002';
  }

  /**
   * Xử lý câu hỏi liên quan đến documents và lấy câu trả lời từ RAG
   */
  async queryDocuments(query: string, botId: number, maxResults: number = 5): Promise<any> {
    try {
      this.logger.log(`Gửi câu hỏi "${query}" đến data-hub cho botId: ${botId}`);

      const response = await axios.post(`${this.dataHubUrl}/rag/query`, {
        query,
        botId,
        maxResults
      });

      return {
        answer: response.data['answer'],
        query: response.data['query'],
        sources: response.data['sources'],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Lỗi khi gọi API RAG của data-hub: ${error.message}`);
      
      if (error.response?.status === 404) {
        this.logger.warn(
          `Endpoint RAG không tìm thấy ở ${this.dataHubUrl}/rag/query. Kiểm tra xem data-hub có đang chạy và đã đăng ký RAG module chưa.`,
        );
      }

      return {
        answer: 'Xin lỗi, tôi không thể trả lời câu hỏi của bạn vào lúc này. Vui lòng thử lại sau.',
        query: query,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}