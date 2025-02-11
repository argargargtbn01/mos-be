import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Department } from 'src/department/entities/department.entity';
import { Role } from 'src/role/entities/role.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string; // Tên hiển thị của user

  @Column()
  email: string; // Email của user

  // Trạng thái: ví dụ "Active" hoặc "Inactive"
  @Column({ default: 'Active' })
  status: string;

  // Liên kết đến phòng ban mà user thuộc về
  @ManyToOne(() => Department, (department) => department.users, { eager: true })
  department: Department;

  // Liên kết đến vai trò của user (Role)
  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;
}
