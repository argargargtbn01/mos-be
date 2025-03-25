"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const axios_1 = __importDefault(require("axios"));
const document_chunk_entity_1 = require("../shared/entities/document-chunk.entity");
const chat_entity_1 = require("./entities/chat.entity");
const message_entity_1 = require("../message/entities/message.entity");
let ChatService = class ChatService {
    constructor(chunkRepository, chatRepository, messageRepository, configService) {
        this.chunkRepository = chunkRepository;
        this.chatRepository = chatRepository;
        this.messageRepository = messageRepository;
        this.configService = configService;
    }
    async processMessage(content, chatId) {
        const questionEmbedding = await this.createEmbedding(content);
        const similarChunks = await this.chunkRepository
            .createQueryBuilder('chunk')
            .select()
            .addSelect(`(chunk.embedding <-> :embedding)`, 'distance')
            .orderBy('"distance"')
            .setParameter('embedding', questionEmbedding)
            .limit(3)
            .getMany();
        const response = `Found ${similarChunks.length} similar document chunks:\n\n${similarChunks
            .map((chunk) => chunk.content)
            .join('\n\n')}`;
        await this.messageRepository.save({
            content,
            response,
            chatId,
            relevantChunks: similarChunks.map((chunk) => chunk.id),
        });
        return response;
    }
    async createEmbedding(text) {
        const response = await axios_1.default.post('https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2', { inputs: text }, {
            headers: {
                Authorization: `Bearer ${this.configService.get('HUGGING_FACE_TOKEN')}`,
                'Content-Type': 'application/json',
            },
        });
        return response.data[0];
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_chunk_entity_1.DocumentChunk)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_entity_1.Chat)),
    __param(2, (0, typeorm_1.InjectRepository)(message_entity_1.Message)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], ChatService);
//# sourceMappingURL=chat.service.js.map