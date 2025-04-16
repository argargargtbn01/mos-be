import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { BotService } from './bot.service';
import { Bot } from './entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { ModelInfo } from '../model/dto/model-info.dto';

@Controller('bots')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  async findAll(): Promise<Bot[]> {
    return this.botService.findAll();
  }

  @Get('with-model-info')
  async findAllWithModelInfo(): Promise<Array<{ bot: Bot, modelInfo?: ModelInfo }>> {
    return this.botService.findAllWithModelInfo();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Bot> {
    return this.botService.findOne(id);
  }

  @Get(':id/with-model-info')
  async getBotWithModelInfo(@Param('id') id: number): Promise<{ bot: Bot, modelInfo?: ModelInfo }> {
    return this.botService.getBotWithModelInfo(id);
  }

  @Post()
  async create(@Body() bot: Partial<Bot>): Promise<Bot> {
    return this.botService.create(bot);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() bot: Partial<Bot>): Promise<Bot> {
    return this.botService.update(id, bot);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.botService.delete(id);
  }
}
