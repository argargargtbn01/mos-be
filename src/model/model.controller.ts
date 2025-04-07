import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ModelService } from './model.service';
import { Model } from './entities/model.entity';

@Controller('models')
export class ModelController {
  constructor(private readonly modelService: ModelService) {}

  @Get()
  async findAll(): Promise<Model[]> {
    return this.modelService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Model> {
    return this.modelService.findOne(id);
  }

  @Post()
  async create(@Body() model: Partial<Model>): Promise<Model> {
    return this.modelService.create(model);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() model: Partial<Model>): Promise<Model> {
    return this.modelService.update(id, model);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.modelService.delete(id);
  }
}
