import { Bot } from 'src/bot/entities/bot.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Department {
    id: number;
    name: string;
    code: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
    users: User[];
    bots: Bot[];
}
