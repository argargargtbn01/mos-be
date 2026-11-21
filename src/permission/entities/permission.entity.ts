import { Role } from 'src/role/entities/role.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class Permission {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Ví dụ: "CREATE_USER", "UPDATE_CHAT", etc.

  @Column({ nullable: true })
  description: string; // Mô tả về quyền (tuỳ chọn)

  // Liên kết ngược với Role (nhiều quyền có thể thuộc nhiều vai trò)
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
