import { Injectable } from '@nestjs/common';
import { CreateBotApiKeyDto } from './dto/create-bot-api-key.dto';
import { UpdateBotApiKeyDto } from './dto/update-bot-api-key.dto';

@Injectable()
export class BotApiKeyService {
  create(createBotApiKeyDto: CreateBotApiKeyDto) {
    return 'This action adds a new botApiKey';
  }

  findAll() {
    return `This action returns all botApiKey`;
  }

  findOne(id: number) {
    return `This action returns a #${id} botApiKey`;
  }

  update(id: number, updateBotApiKeyDto: UpdateBotApiKeyDto) {
    return `This action updates a #${id} botApiKey`;
  }

  remove(id: number) {
    return `This action removes a #${id} botApiKey`;
  }
}
