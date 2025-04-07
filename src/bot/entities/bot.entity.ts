import { BotApiKey } from 'src/bot-api-key/entities/bot-api-key.entity';
import { Department } from 'src/department/entities/department.entity';
import { Message } from 'src/message/entities/message.entity';
import { Model } from 'src/model/entities/model.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Bot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  prompt: string;

  @Column({ type: 'text', nullable: true })
  condensePrompt: string;

  @ManyToOne(() => Model)
  llmModel: Model;

  @Column({ type: 'json', nullable: true })
  configurations: any;

  @Column({ type: 'json', nullable: true })
  condenseConfigurations: any;

  @Column({ type: 'json', nullable: true })
  dataSourceIds: any;

  @Column({ type: 'text', nullable: true })
  needAssignPrompt: string;

  @Column({ type: 'text', nullable: true })
  agentAssignMessage: string;

  @Column({ type: 'text', nullable: true })
  noAgentAvailableMessage: string;

  @Column({ type: 'text', nullable: true })
  systemTimeoutServiceMessage: string;

  @Column({ type: 'text', nullable: true })
  ratingMessage: string;

  @Column({ type: 'text', nullable: true })
  afterHourMessage: string;

  @ManyToOne(() => Department, (department) => department.bots)
  department: Department;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => BotApiKey, (botApiKey) => botApiKey.bot)
  botApiKeys: BotApiKey[];

  @OneToMany(() => Message, (message) => message.bot)
  messages: Message[];
}
