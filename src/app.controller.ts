import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from 'express';
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
      responsePayload = { text: `Bạn vừa gửi: "${message.text}"` };
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
}
