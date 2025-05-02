import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Department } from '../department/entities/department.entity';
import { Role } from '../role/entities/role.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Kiểm tra xem email đã tồn tại chưa
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException(`Email ${createUserDto.email} đã được sử dụng`);
      }

      const user = this.userRepository.create({
        username: createUserDto.username,
        email: createUserDto.email,
        status: createUserDto.status || 'Active',
      });

      // Gán phòng ban nếu có
      if (createUserDto.departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: createUserDto.departmentId },
        });

        if (!department) {
          throw new NotFoundException(
            `Không tìm thấy phòng ban với ID ${createUserDto.departmentId}`,
          );
        }

        user.department = department;
      }

      // Gán vai trò nếu có
      if (createUserDto.roleId) {
        const role = await this.roleRepository.findOne({
          where: { id: createUserDto.roleId },
        });

        if (!role) {
          throw new NotFoundException(`Không tìm thấy vai trò với ID ${createUserDto.roleId}`);
        }

        user.role = role;
      }

      this.logger.log(`Tạo user mới: ${user.username} (${user.email})`);

      // Lưu user vào database
      const savedUser = await this.userRepository.save(user);

      // Tải lại user với đầy đủ thông tin về department và role
      return await this.userRepository.findOne({
        where: { id: savedUser.id },
        relations: ['department', 'role'],
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tạo user: ${error.message}`);
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        relations: ['department', 'role'],
      });
    } catch (error) {
      this.logger.error(`Lỗi khi lấy danh sách user: ${error.message}`);
      throw error;
    }
  }

  async search(query: string): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: [{ username: Like(`%${query}%`) }, { email: Like(`%${query}%`) }],
        relations: ['department', 'role'],
      });
    } catch (error) {
      this.logger.error(`Lỗi khi tìm kiếm user: ${error.message}`);
      throw error;
    }
  }

  async findByDepartment(departmentId: number): Promise<User[]> {
    try {
      // Kiểm tra xem phòng ban có tồn tại không
      const department = await this.departmentRepository.findOne({
        where: { id: departmentId },
      });

      if (!department) {
        throw new NotFoundException(`Không tìm thấy phòng ban với ID ${departmentId}`);
      }

      return await this.userRepository.find({
        where: { department: { id: departmentId } },
        relations: ['department', 'role'],
      });
    } catch (error) {
      this.logger.error(`Lỗi khi lấy user theo phòng ban: ${error.message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['department', 'role'],
      });

      if (!user) {
        throw new NotFoundException(`Không tìm thấy user với ID ${id}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Lỗi khi lấy thông tin user ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      // Kiểm tra xem user có tồn tại không
      const user = await this.findOne(id);

      // Kiểm tra xem email mới đã tồn tại chưa (nếu có thay đổi email)
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          throw new BadRequestException(`Email ${updateUserDto.email} đã được sử dụng`);
        }
      }

      // Cập nhật thông tin cơ bản
      if (updateUserDto.username) user.username = updateUserDto.username;
      if (updateUserDto.email) user.email = updateUserDto.email;
      if (updateUserDto.status) user.status = updateUserDto.status;

      // Cập nhật phòng ban nếu có
      if (updateUserDto.departmentId) {
        const department = await this.departmentRepository.findOne({
          where: { id: updateUserDto.departmentId },
        });

        if (!department) {
          throw new NotFoundException(
            `Không tìm thấy phòng ban với ID ${updateUserDto.departmentId}`,
          );
        }

        user.department = department;
      }

      // Cập nhật vai trò nếu có
      if (updateUserDto.roleId) {
        const role = await this.roleRepository.findOne({
          where: { id: updateUserDto.roleId },
        });

        if (!role) {
          throw new NotFoundException(`Không tìm thấy vai trò với ID ${updateUserDto.roleId}`);
        }

        user.role = role;
      }

      this.logger.log(`Cập nhật thông tin user ID ${id}: ${user.username}`);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật user ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateStatus(id: number, status: string): Promise<User> {
    try {
      // Kiểm tra status có hợp lệ không
      if (!['Active', 'Inactive'].includes(status)) {
        throw new BadRequestException(
          'Trạng thái không hợp lệ. Trạng thái phải là "Active" hoặc "Inactive"',
        );
      }

      // Kiểm tra xem user có tồn tại không
      const user = await this.findOne(id);

      // Cập nhật trạng thái
      user.status = status;

      this.logger.log(`Cập nhật trạng thái user ID ${id} thành ${status}`);
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.error(`Lỗi khi cập nhật trạng thái user ID ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number): Promise<void> {
    try {
      // Kiểm tra xem user có tồn tại không
      await this.findOne(id);

      const result = await this.userRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Không tìm thấy user với ID ${id}`);
      }

      this.logger.log(`Đã xóa user với ID ${id}`);
    } catch (error) {
      this.logger.error(`Lỗi khi xóa user ID ${id}: ${error.message}`);
      throw error;
    }
  }
}
