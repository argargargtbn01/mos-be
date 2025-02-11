import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.find();
  }

  async findOne(id: number): Promise<Department> {
    return this.departmentRepository.findOneBy({ id });
  }

  async create(department: Partial<Department>): Promise<Department> {
    const newDept = this.departmentRepository.create(department);
    return this.departmentRepository.save(newDept);
  }

  async update(id: number, department: Partial<Department>): Promise<Department> {
    await this.departmentRepository.update(id, department);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.departmentRepository.delete(id);
  }
}
