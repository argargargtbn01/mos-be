import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
export declare class DepartmentService {
    private departmentRepository;
    constructor(departmentRepository: Repository<Department>);
    findAll(): Promise<Department[]>;
    findOne(id: number): Promise<Department>;
    create(department: Partial<Department>): Promise<Department>;
    update(id: number, department: Partial<Department>): Promise<Department>;
    delete(id: number): Promise<void>;
}
