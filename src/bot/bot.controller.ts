import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { Bot } from './entities/bot.entity';

@Controller('bots')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Get()
  async findAll(): Promise<Bot[]> {
    return this.botService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Bot> {
    return this.botService.findOne(id);
  }

  @Post()
  async create(@Body() Bot: Partial<Bot>): Promise<Bot> {
    return this.botService.create(Bot);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() Bot: Partial<Bot>,
  ): Promise<Bot> {
    return this.botService.update(id, Bot);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.botService.delete(id);
  }
}
