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
  UseGuards,
  HttpException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Response } from 'src/common/globalClass';
import { HttpStatus, Message } from 'src/common/globalEnum';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorators';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { DecodedId } from 'src/common/decorators/decode-id.decorators';

@Controller('users')
//@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtUtilityService: JwtUtilityService,
  ) {}

  @Post()
  async create(
    @Body(new ValidationPipe()) user: CreateUserDto,
  ): Promise<Response<User>> {
    try {
      const newUser = await this.userService.create(user);
      return new Response(newUser, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get()
  async findAll(
    @Query('role') role?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ): Promise<
    Response<{ items: any; total: number; limit?: number; page?: number }>
  > {
    try {
      const users = await this.userService.getAllUser(
        role,
        search,
        limit,
        page,
      );
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
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Get(':id')
  async findOne(@DecodedId(["params"]) id: number): Promise<Response<User>> {
    try {
      const decodedId = this.jwtUtilityService.decodeId(id);
      const user = await this.userService.findByID(decodedId);
      return user
        ? new Response(user, HttpStatus.SUCCESS, Message.SUCCESS)
        : new Response(null, HttpStatus.UNAUTHORIZED, Message.UNAUTHORIZED);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Put(':id')
  async update(
    @DecodedId(["params"]) id: number,
    @Body(new ValidationPipe()) user: UpdateUserDto,
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
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@DecodedId(["params"]) id: number): Promise<Response<void>> {
    try {
      await this.userService.delete(id);
      return new Response(null, HttpStatus.SUCCESS, Message.SUCCESS);
    } catch (error) {
      throw new HttpException(
        { statusCode: HttpStatus.ERROR, message: error.message },
        HttpStatus.ERROR,
      );
    }
  }
}
