import { AppService } from './app.service';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    private readonly appId;
    private readonly accessToken;
    private readonly secretKey;
    getHello(): string;
    verifyWebhook(mode: string, verifyToken: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    handleWebhook(body: any): Promise<string>;
    handleMessage(senderId: string, message: any): Promise<void>;
    callSendAPI(senderId: string, responsePayload: any): Promise<void>;
    handleWebhook1(body: any, res: Response): Promise<void>;
    handleMessage1(userId: string, message: string): Promise<void>;
    callSendAPI1(userId: string, responsePayload: any): Promise<void>;
}
