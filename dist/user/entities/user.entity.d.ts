import { Department } from 'src/department/entities/department.entity';
import { Role } from 'src/role/entities/role.entity';
export declare class User {
    id: number;
    username: string;
    email: string;
    status: string;
    department: Department;
    role: Role;
}
