import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { DocumentChunk } from '../shared/entities/document-chunk.entity';
import { Chat } from './entities/chat.entity';
import { Message } from '../message/entities/message.entity';
export declare class ChatService {
    private chunkRepository;
    private chatRepository;
    private messageRepository;
    private configService;
    constructor(chunkRepository: Repository<DocumentChunk>, chatRepository: Repository<Chat>, messageRepository: Repository<Message>, configService: ConfigService);
    processMessage(content: string, chatId: string): Promise<string>;
    private createEmbedding;
}
