import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';

@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  async findAll(): Promise<Department[]> {
    return this.departmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Department> {
    return this.departmentService.findOne(id);
  }

  @Post()
  async create(@Body() department: Partial<Department>): Promise<Department> {
    return this.departmentService.create(department);
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() department: Partial<Department>,
  ): Promise<Department> {
    return this.departmentService.update(id, department);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.departmentService.delete(id);
  }
}
