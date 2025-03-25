import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
export declare class Role {
    id: number;
    name: string;
    description: string;
    users: User[];
    permissions: Permission[];
}
