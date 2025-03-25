import { BotApiKey } from 'src/bot-api-key/entities/bot-api-key.entity';
import { Department } from 'src/department/entities/department.entity';
import { Message } from 'src/message/entities/message.entity';
export declare class Bot {
    id: number;
    name: string;
    slug: string;
    description: string;
    prompt: string;
    condensePrompt: string;
    llmModelId: string;
    configurations: any;
    condenseConfigurations: any;
    dataSourceIds: any;
    needAssignPrompt: string;
    agentAssignMessage: string;
    noAgentAvailableMessage: string;
    systemTimeoutServiceMessage: string;
    ratingMessage: string;
    afterHourMessage: string;
    department: Department;
    created_at: Date;
    updated_at: Date;
    botApiKeys: BotApiKey[];
    messages: Message[];
}
