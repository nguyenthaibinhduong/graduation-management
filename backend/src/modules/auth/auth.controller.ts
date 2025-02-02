import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}
  @Post('/register')
  register(@Body() userData: any) {
    return this.userService.register(userData);
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Request() request: any) {
    return this.authService.login(request.user);
  }
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() request: any) {
    return request.user;
  }

  @Post('refresh-token')
  async refreshToken(@Body('refresh_token') refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }
    const newToken = await this.authService.verifyRefreshToken(refreshToken);
    if (!newToken) {
      throw new BadRequestException('Invalid refresh token');
    }
    return {
      access_token: newToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() request: any) {
    const userId = request.user.id;
    await this.userService.deleteRefreshToken(userId);
    return { message: 'Đăng xuất thành công' };
  }
}
