import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
export declare class BotController {
    private readonly botService;
    constructor(botService: BotService);
    create(createBotDto: CreateBotDto): string;
    findAll(): string;
    findOne(id: string): string;
    update(id: string, updateBotDto: UpdateBotDto): string;
    remove(id: string): string;
}
