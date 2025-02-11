import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BotApiKeyService } from './bot-api-key.service';
import { CreateBotApiKeyDto } from './dto/create-bot-api-key.dto';
import { UpdateBotApiKeyDto } from './dto/update-bot-api-key.dto';

@Controller('bot-api-key')
export class BotApiKeyController {
  constructor(private readonly botApiKeyService: BotApiKeyService) {}

  @Post()
  create(@Body() createBotApiKeyDto: CreateBotApiKeyDto) {
    return this.botApiKeyService.create(createBotApiKeyDto);
  }

  @Get()
  findAll() {
    return this.botApiKeyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.botApiKeyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBotApiKeyDto: UpdateBotApiKeyDto) {
    return this.botApiKeyService.update(+id, updateBotApiKeyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.botApiKeyService.remove(+id);
  }
}
