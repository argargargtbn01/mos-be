import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { BotModule } from './bot/bot.module';
import { DepartmentModule } from './department/department.module';
import { BotApiKeyModule } from './bot-api-key/bot-api-key.module';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { ConfigModule } from '@nestjs/config';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Chỉ dùng synchronize: true cho development
    }),
    DepartmentModule,
    UserModule,
    BotModule,
    BotApiKeyModule,
    ChatModule,
    MessageModule,
    RoleModule,
    PermissionModule,
  ],
})
export class AppModule {}
