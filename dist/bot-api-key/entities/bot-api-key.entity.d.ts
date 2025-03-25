import { Bot } from 'src/bot/entities/bot.entity';
export declare class BotApiKey {
    id: number;
    key: string;
    active: boolean;
    bot: Bot;
    created_at: Date;
    updated_at: Date;
}
