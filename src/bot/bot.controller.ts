import { Controller, Get, Param, Post, Body, Put, Delete, Logger } from '@nestjs/common';
import { BotService } from './bot.service';
import { Bot } from './entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { ModelInfo } from '../model/dto/model-info.dto';

@Controller('bots')
export class BotController {
  private readonly logger = new Logger(BotController.name);

  constructor(private readonly botService: BotService) {}

  @Get()
  async getAllBots() {
    this.logger.log('Nhận yêu cầu lấy tất cả bot');
    return this.botService.findAll();
  }

  @Get('with-model-info')
  async findAllWithModelInfo(): Promise<Array<{ bot: Bot; modelInfo?: ModelInfo }>> {
    return this.botService.findAllWithModelInfo();
  }

  @Get(':id')
  async getBotById(@Param('id') id: number) {
    this.logger.log(`Nhận yêu cầu lấy thông tin bot id: ${id}`);
    return this.botService.findOne(id);
  }

  @Get(':id/with-model-info')
  async getBotWithModelInfo(@Param('id') id: number): Promise<{ bot: Bot; modelInfo?: ModelInfo }> {
    return this.botService.getBotWithModelInfo(id);
  }

  @Post()
  async createBot(@Body() botData: any) {
    this.logger.log('Nhận yêu cầu tạo bot mới');
    return this.botService.create(botData);
  }

  @Put(':id')
  async updateBot(@Param('id') id: number, @Body() botData: any) {
    this.logger.log(`Nhận yêu cầu cập nhật bot id: ${id}`);
    return this.botService.update(id, botData);
  }

  @Delete(':id')
  async deleteBot(@Param('id') id: number) {
    this.logger.log(`Nhận yêu cầu xóa bot id: ${id}`);
    return this.botService.delete(id);
  }
}
