import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly JwtService: JwtService,
  ) {}
  async login(user: any) {
    const payload = { id: user.id, email: user.email };
    const refreshToken = this.JwtService.sign(payload, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    });
    this.userService.saveRefreshToken(refreshToken, user.id, 604800);
    return {
      access_token: this.JwtService.sign(payload),
      refresh_token: refreshToken,
    };
  }
  async verifyRefreshToken(refreshToken: string) {
    const decode = this.JwtService.decode(refreshToken);
    if (decode) {
      // throw new UnauthorizedException('Invalid refresh token');
      const user = await this.userService.verifyRefreshToken(
        refreshToken,
        decode.id,
      );
      if (user) {
        const payload = { id: user.id, email: user.email };
        return this.JwtService.sign(payload);
      }
    }
    return false;
  }
}
