import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from './entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Bot)
    private botRepository: Repository<Bot>,
  ) {}

  async findAll(): Promise<Bot[]> {
    return this.botRepository.find();
  }

  async findOne(id: number): Promise<Bot> {
    return this.botRepository.findOneBy({ id });
  }

  async create(Bot: Partial<Bot>): Promise<Bot> {
    const newDept = this.botRepository.create(Bot);
    return this.botRepository.save(newDept);
  }

  async update(id: number, Bot: Partial<Bot>): Promise<Bot> {
    await this.botRepository.update(id, Bot);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.botRepository.delete(id);
  }
}
