import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bot } from './entities/bot.entity';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { ModelModule } from '../model/model.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [TypeOrmModule.forFeature([Bot]), ModelModule, RagModule],
  providers: [BotService],
  controllers: [BotController],
  exports: [BotService],
})
export class BotModule {}
