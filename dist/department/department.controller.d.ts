import { DepartmentService } from './department.service';
import { Department } from './entities/department.entity';
export declare class DepartmentController {
    private readonly departmentService;
    constructor(departmentService: DepartmentService);
    findAll(): Promise<Department[]>;
    findOne(id: number): Promise<Department>;
    create(department: Partial<Department>): Promise<Department>;
    update(id: number, department: Partial<Department>): Promise<Department>;
    delete(id: number): Promise<void>;
}
