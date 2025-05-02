import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Tên người dùng không được để trống' })
  @IsString({ message: 'Tên người dùng phải là chuỗi' })
  username: string;

  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsOptional()
  @IsString({ message: 'Trạng thái người dùng phải là chuỗi' })
  status?: string;

  @IsNumber({}, { message: 'ID phòng ban phải là số' })
  @IsOptional()
  departmentId?: number;

  @IsNumber({}, { message: 'ID vai trò phải là số' })
  @IsOptional()
  roleId?: number;
}
