import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { DocumentChunk } from '../shared/entities/document-chunk.entity';
import { Chat } from './entities/chat.entity';
import { Message } from '../message/entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(DocumentChunk)
    private chunkRepository: Repository<DocumentChunk>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private configService: ConfigService,
  ) {}

  async processMessage(content: string, chatId: string): Promise<string> {
    // 1. Create embedding for question
    const questionEmbedding = await this.createEmbedding(content);

    // 2. Find most similar chunks
    const similarChunks = await this.chunkRepository
      .createQueryBuilder('chunk')
      .select()
      .addSelect(`(chunk.embedding <-> :embedding)`, 'distance')
      .orderBy('"distance"')
      .setParameter('embedding', questionEmbedding)
      .limit(3)
      .getMany();

    // 3. Create simple response using similar chunks
    const response = `Found ${similarChunks.length} similar document chunks:\n\n${similarChunks
      .map((chunk) => chunk.content)
      .join('\n\n')}`;

    // 4. Save message to database
    await this.messageRepository.save({
      content,
      response,
      chatId,
      relevantChunks: similarChunks.map((chunk) => chunk.id),
    });

    return response;
  }

  private async createEmbedding(text: string): Promise<number[]> {
    interface HuggingFaceResponse {
      data: number[];
    }

    const response = await axios.post<HuggingFaceResponse>(
      'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2',
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${this.configService.get('HUGGING_FACE_TOKEN')}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data[0];
  }
}
