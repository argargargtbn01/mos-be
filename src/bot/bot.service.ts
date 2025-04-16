import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bot } from './entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { ModelService } from '../model/model.service';
import { ModelInfo } from '../model/dto/model-info.dto';

@Injectable()
export class BotService {
  constructor(
    @InjectRepository(Bot)
    private botRepository: Repository<Bot>,
    private readonly modelService: ModelService,
  ) {}

  async findAll(): Promise<Bot[]> {
    return this.botRepository.find();
  }

  async findOne(id: number): Promise<Bot> {
    return this.botRepository.findOneBy({ id });
  }

  async create(bot: Partial<Bot>): Promise<Bot> {
    const newBot = this.botRepository.create(bot);
    return this.botRepository.save(newBot);
  }

  async update(id: number, bot: Partial<Bot>): Promise<Bot> {
    await this.botRepository.update(id, bot);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.botRepository.delete(id);
  }

  // Method to get bot details with model information from API
  async getBotWithModelInfo(id: number): Promise<{ bot: Bot, modelInfo?: ModelInfo }> {
    const bot = await this.findOne(id);
    
    if (!bot) {
      throw new NotFoundException(`Bot with ID ${id} not found`);
    }

    let modelInfo = null;
    if (bot.modelName) {
      try {
        modelInfo = await this.modelService.findByName(bot.modelName);
      } catch (error) {
        console.error(`Error fetching model info for bot ${id}:`, error);
      }
    }

    return {
      bot,
      modelInfo: modelInfo || undefined
    };
  }

  // Method to get all bots with their model information
  async findAllWithModelInfo(): Promise<Array<{ bot: Bot, modelInfo?: ModelInfo }>> {
    const bots = await this.findAll();
    let models: ModelInfo[] = [];
    
    try {
      models = await this.modelService.findAll();
    } catch (error) {
      console.error('Error fetching models:', error);
    }

    return bots.map(bot => {
      const modelInfo = models.find(model => model.model_name === bot.modelName);
      return {
        bot,
        modelInfo
      };
    });
  }
}
