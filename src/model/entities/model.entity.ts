import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Model {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column()
  provider: string;

  // Loại model, ví dụ: "Language Model", "Vision Model"
  @Column()
  type: string;

  // Trạng thái: Active / Inactive
  @Column({ default: 'Active' })
  status: string;

  // Thời gian tạo bản ghi
  @CreateDateColumn()
  created_at: Date;

  // Thời gian cập nhật bản ghi
  @UpdateDateColumn()
  updated_at: Date;
}
