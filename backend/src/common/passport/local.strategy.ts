import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from 'src/modules/auth/auth.service';
import { UsersService } from 'src/modules/users/users.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly UserService: UsersService) {
    super({ usernameField: 'username' });
  }
  async validate(username: string, password: string) {
    const user = await this.UserService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không đúng');
    }
    return user;
  }
}
