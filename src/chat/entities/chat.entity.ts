import { Message } from 'src/message/entities/message.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  platform: string;

  @ManyToOne(() => User)
  user: User;

  @Column({ nullable: true })
  lastMessageTimeAgent: Date;

  @Column({ nullable: true })
  lastMessageTimeUser: Date;

  @Column({ nullable: true })
  lastMessageTimeBot: Date;

  @Column({ nullable: true })
  bot: string;

  @Column({ default: false })
  isFinish: boolean;

  @Column({ default: false })
  isLateCall: boolean;

  @Column({ type: 'float', nullable: true })
  totalTimeAgentResponse: number;

  @Column({ type: 'float', nullable: true })
  totalAgentResponse: number;

  @Column({ nullable: true })
  lastMessageTime: Date;

  @Column({ type: 'json', nullable: true })
  files: any;

  @Column({ default: false })
  isNeedAgent: boolean;

  @Column({ nullable: true })
  source: string;

  @Column({ default: false })
  waitFirstAgentResponse: boolean;

  @Column({ nullable: true })
  biz: string;

  @Column({ nullable: true })
  hostName: string;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
