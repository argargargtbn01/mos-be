import { Bot } from 'src/bot/entities/bot.entity';
import { Chat } from 'src/chat/entities/chat.entity';
export declare class Message {
    id: number;
    chat: Chat;
    text: string;
    type: string;
    source: string;
    logs: any;
    comment: string;
    team_id: string;
    bot: Bot;
    input_tokens: number;
    output_tokens: number;
    price_per_input_token: number;
    price_per_output_token: number;
    response_time: number;
    finish_reason: string;
    finish_note: string;
    user_message_id: string;
    relevantChunks: string[];
    response: string;
}
