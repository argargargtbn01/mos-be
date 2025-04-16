import { Injectable } from '@nestjs/common';
import { CreateModelDto } from './dto/create-model.dto';
import { UpdateModelDto } from './dto/update-model.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from './entities/model.entity';

@Injectable()
export class ModelService {
  constructor(
      @InjectRepository(Model)
      private modelRepository: Repository<Model>,
    ) {}
  
    async findAll(): Promise<Model[]> {
      return this.modelRepository.find();
    }
  
    async findOne(id: number): Promise<Model> {
      return this.modelRepository.findOneBy({ id });
    }
  
    async create(model: Partial<Model>): Promise<Model> {
      const newDept = this.modelRepository.create(model);
      return this.modelRepository.save(newDept);
    }
  
    async update(id: number, model: Partial<Model>): Promise<Model> {
      await this.modelRepository.update(id, model);
      return this.findOne(id);
    }
  
    async delete(id: number): Promise<void> {
      await this.modelRepository.delete(id);
    }
}
