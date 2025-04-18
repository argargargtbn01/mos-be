import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';
import { ModelInfoDto, ModelInfo } from './dto/model-info.dto';
import axios from 'axios';

@Injectable()
export class ModelService {
  constructor(
    @InjectRepository(Model)
    private modelRepository: Repository<Model>,
  ) {}

  async findAll(): Promise<ModelInfo[]> {
    try {
      const response = await axios.get(`${process.env.AI_HUB_BASE_URL}/v1/model/info`, {
        headers: {
          Authorization: 'Bearer sk-1234',
        },
      });

      return response.data['data'];
    } catch (error) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
  }

  async findOne(id: number): Promise<Model> {
    return this.modelRepository.findOneBy({ id });
  }

  async findByName(name: string): Promise<ModelInfo | undefined> {
    try {
      const models = await this.findAll();
      return models.find((model) => model.model_name === name);
    } catch (error) {
      throw new HttpException(
        `Error finding model by name: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async create(model: Partial<Model>): Promise<Model> {
    const newModel = this.modelRepository.create(model);
    return this.modelRepository.save(newModel);
  }

  async update(id: number, model: Partial<Model>): Promise<Model> {
    await this.modelRepository.update(id, model);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.modelRepository.delete(id);
  }
}
