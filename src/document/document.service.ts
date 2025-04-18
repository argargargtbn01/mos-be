import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import axios from 'axios';
import FormData from 'form-data';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly dataProcessingJobBaseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.dataProcessingJobBaseUrl =
      this.configService.get<string>('DATA_PROCESSING_URL') || 'http://localhost:3001'; // Sử dụng port 3001 cho data-processing-job
  }

  async create(createDocumentDto: CreateDocumentDto) {
    try {
      const response = await axios.post(
        `${this.dataProcessingJobBaseUrl}/documents`,
        createDocumentDto,
      );
      return response.data;
    } catch (error) {
      this.logger.error(error.response?.data);
      throw error;
    }
  }

  async uploadFile(file: Express.Multer.File, botId: number) {
    try {
      // Kiểm tra nếu file là null hoặc undefined
      if (!file) {
        this.logger.error('No file received in document service');
        throw new BadRequestException('No file uploaded');
      }

      // Kiểm tra nếu file.buffer là null hoặc undefined
      if (!file.buffer) {
        this.logger.error('File buffer is missing');
        throw new BadRequestException('File buffer is missing');
      }

      // Chuẩn bị FormData để gửi file đến data-processing-job
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('botId', botId.toString());

      this.logger.log(`Uploading file ${file.originalname} for bot ${botId}`);

      // Gọi API upload của data-processing-job
      const response = await axios.post(
        `${this.dataProcessingJobBaseUrl}/documents/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Upload error: ${error.message || error}`);
      throw error;
    }
  }

  async findAll(botId?: number) {
    const url = botId
      ? `${this.dataProcessingJobBaseUrl}/documents?botId=${botId}`
      : `${this.dataProcessingJobBaseUrl}/documents`;

    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      this.logger.error(error.response?.data);
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const response = await axios.get(`${this.dataProcessingJobBaseUrl}/documents/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      this.logger.error(error.response?.data);
      throw error;
    }
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto) {
    try {
      const response = await axios.patch(
        `${this.dataProcessingJobBaseUrl}/documents/${id}`,
        updateDocumentDto,
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      this.logger.error(error.response?.data);
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const response = await axios.delete(`${this.dataProcessingJobBaseUrl}/documents/${id}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      this.logger.error(error.response?.data);
      throw error;
    }
  }

  async findByBotId(botId: number) {
    try {
      const response = await axios.get(`${this.dataProcessingJobBaseUrl}/documents/bot/${botId}`);
      return response.data;
    } catch (error) {
      this.logger.error(error.response?.data);
      throw error;
    }
  }
}
