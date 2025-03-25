import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
export declare class BotService {
    create(createBotDto: CreateBotDto): string;
    findAll(): string;
    findOne(id: number): string;
    update(id: number, updateBotDto: UpdateBotDto): string;
    remove(id: number): string;
}
