import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Chat {
    id: number;
    title: string;
    platform: string;
    user: User;
    lastMessageTimeUser: Date;
    lastMessageTimeBot: Date;
    bot: string;
    isFinish: boolean;
    lastMessageTime: Date;
    files: any;
    source: string;
    biz: string;
    hostName: string;
    messages: Message[];
}
