import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class DocumentQueryService {
  private readonly logger = new Logger(DocumentQueryService.name);
  private readonly dataHubUrl: string;

  constructor(private configService: ConfigService) {
    this.dataHubUrl = this.configService.get<string>('DATA_HUB_URL') || 'http://quang1709.ddns.net:3002';
  }

  /**
   * Xử lý câu hỏi liên quan đến documents và lấy câu trả lời từ RAG
   */
  async queryDocuments(query: string, botId: number, maxResults = 5): Promise<any> {
    try {
      this.logger.log(`Gửi câu hỏi "${query}" đến data-hub cho botId: ${botId}`);

      // Sử dụng quy trình cũ nhưng đã được cải tiến để LLM được xử lý ở mos-be
      this.logger.log(`Sử dụng quy trình RAG cũ được cải tiến cho câu hỏi "${query}"`);

      try {
        // Gọi đến data-hub để lấy context từ vector search
        const response = await axios.post(`${this.dataHubUrl}/rag/query`, {
          query,
          botId,
          maxResults,
        });

        // Nếu có lỗi từ data-hub
        if (response.data['error']) {
          this.logger.warn(`Lỗi từ data-hub: ${response.data['error']}`);
          return {
            answer: `Xin lỗi, đã xảy ra lỗi khi tìm kiếm thông tin: ${response.data['error']}`,
            query: query,
            error: response.data['error'],
            timestamp: new Date().toISOString(),
          };
        }

        // Nếu không có context hoặc sources
        if (
          (!response.data['context'] || response.data['context'].trim() === '') &&
          (!response.data['sources'] || response.data['sources'].length === 0)
        ) {
          return {
            answer:
              'Tôi không tìm thấy thông tin liên quan trong cơ sở dữ liệu để trả lời câu hỏi này.',
            query: query,
            sources: [],
            timestamp: new Date().toISOString(),
          };
        }

        // Lấy context từ kết quả của data-hub
        const context =
          response.data['context'] || this.buildContextFromSources(response.data['sources']);

        // Log context
        this.logger.log(`Context nhận được từ data-hub (${context.length} ký tự):`);
        this.logger.log(`${context.substring(0, 500)}${context.length > 500 ? '...' : ''}`);

        // Gọi LLM với context - sử dụng RagService đã có sẵn để tận dụng lại code
        // const answer = await this.ragService.generateLlmResponse(query, context, []);
        // Trả về kết quả
        return {
          answer: response.data['answer'],
          query: response.data['query'],
          sources: response.data['sources'] || [],
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        this.logger.error(`Lỗi khi gọi API data-hub: ${error.message}`);

        if (error.response?.status === 404) {
          this.logger.warn(
            `Endpoint RAG không tìm thấy ở ${this.dataHubUrl}/rag/query. Kiểm tra xem data-hub có đang chạy và đã đăng ký RAG module chưa.`,
          );
        }

        return {
          answer:
            'Xin lỗi, tôi không thể trả lời câu hỏi của bạn vào lúc này. Vui lòng thử lại sau.',
          query: query,
          error: error.message,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      this.logger.error(`Lỗi khi xử lý câu hỏi RAG: ${error.message}`);

      return {
        answer: 'Xin lỗi, tôi không thể trả lời câu hỏi của bạn vào lúc này. Vui lòng thử lại sau.',
        query: query,
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Tạo context từ các sources
   */
  private buildContextFromSources(sources: any[]): string {
    if (!sources || !Array.isArray(sources) || sources.length === 0) {
      return '';
    }

    return sources
      .map(
        (source, index) =>
          `[Chunk ${index + 1}] (Nguồn: ${source.source || 'unknown'}, Độ tương đồng: ${(
            source.similarity * 100
          ).toFixed(2)}%)\n${source.textPreview || ''}`,
      )
      .join('\n\n');
  }
}
