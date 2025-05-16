import {
  ConflictException,
  Injectable,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly JwtService: JwtService,
  ) {}
  async login(user: any, res: Response) {
    const payload = { id: user.id, username: user.username, role: user.role };
    // 🔐 Tạo Access Token (Hết hạn trong 15 phút)
    const accessToken = this.JwtService.sign(payload, {
      expiresIn: '60m',
      secret: process.env.JWT_ACCESS_SECRET, // Sử dụng secret riêng
    });

    // 🔐 Tạo Refresh Token (Hết hạn trong 7 ngày)
    const refreshToken = this.JwtService.sign(payload, {
      expiresIn: '1d',
      secret: process.env.JWT_REFRESH_SECRET, // Secret riêng biệt cho Refresh Token
    });

    this.userService.saveRefreshToken(refreshToken, user.id, 604800);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.json({ access_token: accessToken, user: payload });
  }
  async verifyRefreshToken(refreshToken: string) {
    try {
      const decoded: any = this.JwtService.decode(refreshToken);
      if (!decoded || !decoded.id || !decoded.exp) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const currentTime = Math.floor(Date.now() / 1000); // Thời gian hiện tại (giây)
      if (decoded.exp < currentTime) {
        throw new UnauthorizedException('Refresh token expired');
      }
      const user = await this.userService.verifyRefreshToken(
        refreshToken,
        decoded.id,
      );
      if (!user) {
        throw new UnauthorizedException('Refresh token is invalid or revoked');
      }

      const payload = { id: user.id, username: user.username, role: user.role };
      return this.JwtService.sign(payload, {
        expiresIn: '5m',
        secret: process.env.JWT_ACCESS_SECRET, // Sử dụng secret riêng cho access token
      });
    } catch (error) {
      throw new UnauthorizedException(
        error.message || 'Refresh token verification failed',
      );
    }
  }
  async verifyToken(token: string) {
    try {
      const decoded: any = this.JwtService.verify(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      if (!decoded || !decoded.id || !decoded.exp || !decoded.role) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return true;
    } catch (error) {
      if (error?.message === 'jwt expired') {
        throw new ConflictException('Token đã hết hạn');
      }
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
