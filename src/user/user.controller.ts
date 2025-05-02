import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
  Query,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<any> {
    this.logger.log(`Tạo user mới với email: ${createUserDto.email}`);
    try {
      const user = await this.userService.create(createUserDto);
      return {
        success: true,
        message: 'Tạo user thành công',
        data: user,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tạo user: ${error.message}`);

      // Xử lý lỗi email đã tồn tại
      if (
        error.message &&
        error.message.includes('Email') &&
        error.message.includes('đã được sử dụng')
      ) {
        return {
          success: false,
          message: `Email ${createUserDto.email} đã được sử dụng. Vui lòng sử dụng email khác.`,
          statusCode: HttpStatus.CONFLICT,
        };
      }

      // Xử lý các lỗi khác
      throw new HttpException(`Không thể tạo user: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  async findAll(): Promise<any> {
    this.logger.log('Lấy danh sách tất cả user');
    try {
      const users = await this.userService.findAll();
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách user: ${error.message}`);
      throw new HttpException(
        `Không thể lấy danh sách user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('search')
  async search(@Query('query') query: string): Promise<any> {
    this.logger.log(`Tìm kiếm user với query: ${query}`);
    try {
      const users = await this.userService.search(query);
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi tìm kiếm user: ${error.message}`);
      throw new HttpException(
        `Không thể tìm kiếm user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('department/:departmentId')
  async findByDepartment(@Param('departmentId', ParseIntPipe) departmentId: number): Promise<any> {
    this.logger.log(`Lấy danh sách user theo phòng ban ID: ${departmentId}`);
    try {
      const users = await this.userService.findByDepartment(departmentId);
      return {
        success: true,
        data: users,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy user theo phòng ban: ${error.message}`);
      throw new HttpException(
        `Không thể lấy user theo phòng ban: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<any> {
    this.logger.log(`Lấy thông tin user ID: ${id}`);
    try {
      const user = await this.userService.findOne(id);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thông tin user: ${error.message}`);

      if (error.status === HttpStatus.NOT_FOUND) {
        return {
          success: false,
          message: `User với ID ${id} không tồn tại`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      throw new HttpException(
        `Không thể lấy thông tin user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<any> {
    this.logger.log(`Cập nhật user ID: ${id}`);
    try {
      const user = await this.userService.update(id, updateUserDto);
      return {
        success: true,
        message: 'Cập nhật user thành công',
        data: user,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật user: ${error.message}`);

      // Xử lý lỗi email đã tồn tại
      if (
        error.message &&
        error.message.includes('Email') &&
        error.message.includes('đã được sử dụng')
      ) {
        return {
          success: false,
          message: `Email đã được sử dụng. Vui lòng sử dụng email khác.`,
          statusCode: HttpStatus.CONFLICT,
        };
      }

      // Xử lý lỗi không tìm thấy user
      if (error.status === HttpStatus.NOT_FOUND) {
        return {
          success: false,
          message: `User với ID ${id} không tồn tại`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      throw new HttpException(
        `Không thể cập nhật user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<any> {
    this.logger.log(`Cập nhật trạng thái user ID: ${id} thành ${status}`);
    try {
      const user = await this.userService.updateStatus(id, status);
      return {
        success: true,
        message: `Cập nhật trạng thái thành công thành ${status}`,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật trạng thái user: ${error.message}`);

      // Xử lý lỗi không tìm thấy user
      if (error.status === HttpStatus.NOT_FOUND) {
        return {
          success: false,
          message: `User với ID ${id} không tồn tại`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      throw new HttpException(
        `Không thể cập nhật trạng thái user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<any> {
    this.logger.log(`Xóa user ID: ${id}`);
    try {
      await this.userService.remove(id);
      return {
        success: true,
        message: `Đã xóa user với ID: ${id}`,
      };
    } catch (error) {
      this.logger.error(`Lỗi khi xóa user: ${error.message}`);

      // Xử lý lỗi không tìm thấy user
      if (error.status === HttpStatus.NOT_FOUND) {
        return {
          success: false,
          message: `User với ID ${id} không tồn tại`,
          statusCode: HttpStatus.NOT_FOUND,
        };
      }

      throw new HttpException(
        `Không thể xóa user: ${error.message}`,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
