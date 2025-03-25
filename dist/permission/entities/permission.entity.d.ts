import { Role } from 'src/role/entities/role.entity';
export declare class Permission {
    id: number;
    name: string;
    description: string;
    roles: Role[];
}
