import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Request as Require, Response } from 'express';

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
  login(@Request() request: any, @Res() res: Response) {
    return this.authService.login(request.user, res);
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() request: any) {
    return this.userService.getUserDetails(request.user);
  }
  @UseGuards(JwtAuthGuard)
  @Put('change-password')
  async updatePassword(
    @Request() request: any,
    @Body() data: { oldPassword: string; newPassword: string },
  ) {
    try {
      const userId = request.user.id;
      const { oldPassword, newPassword } = data;
      return await this.userService.updatePassword(
        userId,
        oldPassword,
        newPassword,
      );
    } catch (error) {
      console.error('Error in updatePassword:', error);
      throw error;
    }
  }

  @Post('refresh-token')
  async refreshToken(@Req() req: Require) {
    const refreshToken = req.cookies['refresh_token'];
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

  @Post('verify-token')
  async VerifyToken(@Body() data: any) {
    const tokenCheck = data.token;
    if (!tokenCheck) {
      throw new BadRequestException('No token provided');
    }
    const newToken = await this.authService.verifyToken(tokenCheck);
    if (!newToken) {
      throw new BadRequestException('Invalid refresh token');
    }
    return {
      'Token verified': newToken,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() request: any, @Res() res: Response) {
    try {
      const userId = request.user.id;
      await this.userService.deleteRefreshToken(userId);
      res.clearCookie('refresh_token', {
        httpOnly: true,
        // secure: true, // Chỉ dùng khi HTTPS
        // sameSite: 'None', // Nếu frontend & backend khác domain
      });
      return res.json({ message: 'Logout successfully' });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
