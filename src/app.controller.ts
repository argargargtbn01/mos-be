import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
import axios from 'axios';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    if (mode === 'subscribe' && verifyToken === 'my_secret_token') {
      return res.send(challenge);
    } else {
      return res.send('Invalid request');
    }
  }

  // Endpoint POST để nhận event từ Facebook Messenger
  @Post('/webhook')
  async handleWebhook(@Body() body: any): Promise<string> {
    console.log('Received webhook event:', body);
    if (body.object === 'page') {
      for (const entry of body.entry) {
        const messagingEvents = entry.messaging;
        if (messagingEvents) {
          for (const event of messagingEvents) {
            const senderId = event.sender.id;
            // Nếu có tin nhắn, xử lý nó
            if (event.message) {
              await this.handleMessage(senderId, event.message);
            }
          }
        }
      }
    }
    // Phải trả về 200 OK cho Facebook
    return 'EVENT_RECEIVED';
  }

  // Hàm xử lý tin nhắn nhận được và tạo phản hồi
  async handleMessage(senderId: string, message: any): Promise<void> {
    let responsePayload;
    if (message.text) {
      responsePayload = { text: `VPBANK GENAI TEST` };
    } else {
      responsePayload = { text: 'Không nhận được tin nhắn text' };
    }
    await this.callSendAPI(senderId, responsePayload);
  }

  // Hàm gọi Send API của Facebook để gửi phản hồi cho người dùng
  async callSendAPI(senderId: string, responsePayload: any): Promise<void> {
    const url = `https://graph.facebook.com/v21.0/me/messages?access_token=${process.env.PAGE_ACCESS_TOKEN}`;
    try {
      await axios.post(url, {
        recipient: { id: senderId },
        message: responsePayload,
      });
      console.log(`Message sent to ${senderId}`);
    } catch (error) {
      console.error(`Unable to send message: ${error}`);
    }
  }

  @Get('/zalo/webhook')
  verifyWebhook1(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') verifyToken: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    return res.send('Zalo OK');
  }

  // Endpoint POST để nhận sự kiện từ Zalo
  @Post('/zalo/webhook')
  async handleWebhook1(@Body() body: any, @Res() res: Response): Promise<void> {
    console.log('Received webhook event from Zalo:', body);

    // Xử lý sự kiện tin nhắn
    if (body.event_name === 'user_send_text') {
      const userId = body.sender.id; // ID người gửi
      const message = body.message.text; // Nội dung tin nhắn
      await this.handleMessage1(userId, message);
    }

    // Trả về 200 OK cho Zalo
    res.status(200).send('EVENT_RECEIVED');
  }

  // Hàm xử lý tin nhắn và tạo phản hồi
  async handleMessage1(userId: string, message: string): Promise<void> {
    let responsePayload;
    if (message) {
      responsePayload = { text: `ZALO GENAI TEST: Bạn vừa gửi "${message}"` };
    } else {
      responsePayload = { text: 'Không nhận được tin nhắn' };
    }
    console.log('response payload: ', responsePayload);
    await this.callSendAPI1(userId, responsePayload);
  }

  // Hàm gọi API Zalo để gửi tin nhắn phản hồi
  async callSendAPI1(userId: string, responsePayload: any): Promise<void> {
    const url = 'https://openapi.zalo.me/v3.0/oa/message/cs';
    console.log('payload: ', {
      recipient: { user_id: userId },
      message: responsePayload,
    });

    try {
      await axios.post(
        url,
        {
          recipient: { user_id: userId },
          message: responsePayload,
        },
        {
          headers: {
            access_token: process.env.ZALO_ACCESS_TOKEN,
            'Content-Type': 'application/json', // Đảm bảo header này
          },
        },
      );
      console.log(`Message sent to ${userId}`);
    } catch (error) {
      console.error(`Unable to send message: ${error}`);
    }
  }
}
