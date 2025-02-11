import { Bot } from 'src/bot/entities/bot.entity';
import { Chat } from 'src/chat/entities/chat.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;

  @Column({ type: 'text' })
  text: string;

  @Column()
  type: string;

  @Column({ default: 'Bot' })
  source: string;

  @Column({ type: 'json', nullable: true })
  logs: any;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true })
  team_id: string;

  @ManyToOne(() => Bot, (bot) => bot.messages)
  bot: Bot;

  @Column({ nullable: true })
  input_tokens: number;

  @Column({ nullable: true })
  output_tokens: number;

  @Column({ type: 'float', nullable: true })
  price_per_input_token: number;

  @Column({ type: 'float', nullable: true })
  price_per_output_token: number;

  @Column({ type: 'float', nullable: true })
  response_time: number;

  @Column({ type: 'text', nullable: true })
  finish_reason: string;

  @Column({ type: 'text', nullable: true })
  finish_note: string;

  @Column({ nullable: true })
  user_message_id: string;
}
