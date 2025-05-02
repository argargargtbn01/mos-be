import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
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
    return this.botRepository.find({
      relations: ['department'],
    });
  }

  async findByDepartment(departmentId: number): Promise<Bot[]> {
    return this.botRepository.find({
      where: {
        department: { id: departmentId },
      },
      relations: ['department'],
    });
  }

  async searchBots(query: string): Promise<Bot[]> {
    return this.botRepository.find({
      where: [{ name: Like(`%${query}%`) }, { description: Like(`%${query}%`) }],
      relations: ['department'],
    });
  }

  async findOne(id: number): Promise<Bot> {
    const bot = await this.botRepository.findOne({
      where: { id },
      relations: ['department'],
    });

    if (!bot) {
      throw new NotFoundException(`Bot với ID ${id} không tồn tại`);
    }

    return bot;
  }

  async create(botData: CreateBotDto): Promise<Bot> {
    const newBot = this.botRepository.create(botData);
    return this.botRepository.save(newBot);
  }

  async update(id: number, botData: UpdateBotDto): Promise<Bot> {
    const bot = await this.findOne(id);

    // Cập nhật tất cả các thuộc tính đã được cung cấp
    Object.assign(bot, botData);

    return this.botRepository.save(bot);
  }

  async updatePrompt(id: number, prompt: string): Promise<Bot> {
    const bot = await this.findOne(id);
    bot.prompt = prompt;
    return this.botRepository.save(bot);
  }

  async updateModel(id: number, modelName: string): Promise<Bot> {
    const bot = await this.findOne(id);

    // Kiểm tra xem model có tồn tại không
    try {
      const modelInfo = await this.modelService.findByName(modelName);
      if (!modelInfo) {
        throw new NotFoundException(`Model với tên ${modelName} không tồn tại`);
      }
    } catch (error) {
      throw new NotFoundException(`Không thể xác thực model: ${error.message}`);
    }

    bot.modelName = modelName;
    return this.botRepository.save(bot);
  }

  async delete(id: number): Promise<void> {
    const bot = await this.findOne(id);
    await this.botRepository.remove(bot);
  }

  // Method to get bot details with model information from API
  async getBotWithModelInfo(id: number): Promise<{ bot: Bot; modelInfo?: ModelInfo }> {
    const bot = await this.findOne(id);

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
      modelInfo: modelInfo || undefined,
    };
  }

  // Method to get all bots with their model information
  async findAllWithModelInfo(): Promise<Array<{ bot: Bot; modelInfo?: ModelInfo }>> {
    const bots = await this.findAll();
    let models: ModelInfo[] = [];

    try {
      models = await this.modelService.findAll();
    } catch (error) {
      console.error('Error fetching models:', error);
    }

    return bots.map((bot) => {
      const modelInfo = models.find((model) => model.model_name === bot.modelName);
      return {
        bot,
        modelInfo,
      };
    });
  }
}
