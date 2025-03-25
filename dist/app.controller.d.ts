import { AppService } from './app.service';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    verifyWebhook(mode: string, verifyToken: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    handleWebhook(body: any): Promise<string>;
    handleMessage(senderId: string, message: any): Promise<void>;
    callSendAPI(senderId: string, responsePayload: any): Promise<void>;
}
