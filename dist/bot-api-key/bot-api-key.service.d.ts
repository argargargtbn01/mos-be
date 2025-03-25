import { CreateBotApiKeyDto } from './dto/create-bot-api-key.dto';
import { UpdateBotApiKeyDto } from './dto/update-bot-api-key.dto';
export declare class BotApiKeyService {
    create(createBotApiKeyDto: CreateBotApiKeyDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBotApiKeyDto: UpdateBotApiKeyDto): string;
    remove(id: number): string;
}
