import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentService } from './department.service';
import { DepartmentController } from './department.controller';
import { Department } from './entities/department.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Department])],
  providers: [DepartmentService],
  controllers: [DepartmentController],
  exports: [DepartmentService],
})
export class DepartmentModule {}
