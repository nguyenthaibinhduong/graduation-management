import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) user: CreateUserDto,
  ): Promise<Response<User>> {
    try {
      const newUser = await this.userService.create(user);
      return new Response(newUser, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: any; total: number; limit?: number; page?: number }>
  > {
    try {
      const users = await this.userService.getAll(search, limit, page);
      const usersWithoutPassword = users.items.map((user) => {
        const { password, ...userWithoutPassword } = user; // Tách password khỏi user
        return userWithoutPassword; // Trả về user không có password
      });
      return new Response(
        {
          items: usersWithoutPassword, // Dữ liệu người dùng đã loại bỏ mật khẩu
          total: users.total, // Tổng số người dùng
          limit, // Giới hạn số lượng
          page, // Trang hiện tại
        },
        HttpStatus.SUCCESS,
        Message.SUCCESS,
      );
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Response<User>> {
    try {
      const user = await this.userService.getById({ where: { id } });
      return user
        ? new Response(user, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body(new ValidationPipe()) user: CreateUserDto,
  ): Promise<Response<User>> {
    try {
      const updatedUser = await this.userService.update(
        id,
        { where: { id } },
        user,
      );
      return updatedUser
        ? new Response(updatedUser, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number): Promise<Response<void>> {
    try {
      await this.userService.delete(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      return new Response(null, HttpStatus.ERROR, Message.ERROR);
    }
  }
}
