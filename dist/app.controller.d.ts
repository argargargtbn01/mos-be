import { AppService } from './app.service';
import { Response } from 'express';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    verifyWebhook(mode: string, verifyToken: string, challenge: string, res: Response): Response<any, Record<string, any>>;
}
