import { BotApiKeyService } from './bot-api-key.service';
import { CreateBotApiKeyDto } from './dto/create-bot-api-key.dto';
import { UpdateBotApiKeyDto } from './dto/update-bot-api-key.dto';
export declare class BotApiKeyController {
    private readonly botApiKeyService;
    constructor(botApiKeyService: BotApiKeyService);
    create(createBotApiKeyDto: CreateBotApiKeyDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateBotApiKeyDto: UpdateBotApiKeyDto): string;
    remove(id: string): string;
}
