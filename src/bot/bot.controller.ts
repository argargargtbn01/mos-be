import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Put,
  Delete,
  Logger,
  Query,
  HttpException,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import { BotService } from './bot.service';
import { Bot } from './entities/bot.entity';
import { CreateBotDto } from './dto/create-bot.dto';
import { UpdateBotDto } from './dto/update-bot.dto';
import { ModelInfo } from '../model/dto/model-info.dto';

@Controller('bots')
export class BotController {
  private readonly logger = new Logger(BotController.name);

  constructor(private readonly botService: BotService) {}

  @Get()
  async getAllBots() {
    this.logger.log('Nhận yêu cầu lấy tất cả bot');
    return this.botService.findAll();
  }

  @Get('with-model-info')
  async findAllWithModelInfo(): Promise<Array<{ bot: Bot; modelInfo?: ModelInfo }>> {
    this.logger.log('Nhận yêu cầu lấy tất cả bot kèm thông tin model');
    return this.botService.findAllWithModelInfo();
  }

  @Get('by-department/:departmentId')
  async getBotsByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number) {
    this.logger.log(`Nhận yêu cầu lấy bot theo phòng ban id: ${departmentId}`);
    return this.botService.findByDepartment(departmentId);
  }

  @Get('search')
  async searchBots(@Query('query') query: string) {
    this.logger.log(`Nhận yêu cầu tìm kiếm bot với query: ${query}`);
    return this.botService.searchBots(query);
  }

  @Get(':id')
  async getBotById(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Nhận yêu cầu lấy thông tin bot id: ${id}`);
    try {
      const bot = await this.botService.findOne(id);
      if (!bot) {
        throw new HttpException(`Bot với ID ${id} không tồn tại`, HttpStatus.NOT_FOUND);
      }
      return bot;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thông tin bot: ${error.message}`);
      throw error;
    }
  }

  @Get(':id/with-model-info')
  async getBotWithModelInfo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ bot: Bot; modelInfo?: ModelInfo }> {
    this.logger.log(`Nhận yêu cầu lấy thông tin bot và model id: ${id}`);
    try {
      return await this.botService.getBotWithModelInfo(id);
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thông tin bot và model: ${error.message}`);
      throw error;
    }
  }

  @Post()
  async createBot(@Body() botData: CreateBotDto) {
    this.logger.log('Nhận yêu cầu tạo bot mới');
    try {
      return await this.botService.create(botData);
    } catch (error) {
      this.logger.error(`Lỗi khi tạo bot mới: ${error.message}`);
      throw new HttpException(`Không thể tạo bot: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  async updateBot(@Param('id', ParseIntPipe) id: number, @Body() botData: UpdateBotDto) {
    this.logger.log(`Nhận yêu cầu cập nhật bot id: ${id}`);
    try {
      const bot = await this.botService.update(id, botData);
      if (!bot) {
        throw new HttpException(`Bot với ID ${id} không tồn tại`, HttpStatus.NOT_FOUND);
      }
      return bot;
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật bot: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/prompt')
  async updatePrompt(@Param('id', ParseIntPipe) id: number, @Body('prompt') prompt: string) {
    this.logger.log(`Nhận yêu cầu cập nhật prompt cho bot id: ${id}`);
    try {
      return await this.botService.updatePrompt(id, prompt);
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật prompt: ${error.message}`);
      throw error;
    }
  }

  @Put(':id/model')
  async updateModel(@Param('id', ParseIntPipe) id: number, @Body('modelName') modelName: string) {
    this.logger.log(`Nhận yêu cầu cập nhật model cho bot id: ${id}`);
    try {
      return await this.botService.updateModel(id, modelName);
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật model: ${error.message}`);
      throw error;
    }
  }

  @Delete(':id')
  async deleteBot(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Nhận yêu cầu xóa bot id: ${id}`);
    try {
      await this.botService.delete(id);
      return { message: `Xóa bot id ${id} thành công` };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa bot: ${error.message}`);
      throw new HttpException(`Không thể xóa bot: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
