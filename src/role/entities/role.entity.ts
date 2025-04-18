import { Permission } from 'src/permission/entities/permission.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Ví dụ: "Admin", "User", "Manager"

  @Column({ nullable: true })
  description: string; // Mô tả vai trò (tuỳ chọn)

  // Một Role có thể có nhiều User
  @OneToMany(() => User, (user) => user.role)
  users: User[];

  // Một Role có thể có nhiều Permission (và ngược lại)
  @ManyToMany(() => Permission, (permission) => permission.roles, { cascade: true })
  @JoinTable() // Tạo bảng trung gian để liên kết Role - Permission
  permissions: Permission[];
}
