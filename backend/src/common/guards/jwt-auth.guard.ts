import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info, context, status) {
    // Nếu token hết hạn (TokenExpiredError) thì trả về mã lỗi 410 (Gone)
    if (info && info.name === 'TokenExpiredError') {
      throw new ConflictException('Token đã hết hạn');
    }
    // Nếu có lỗi khác hoặc user không hợp lệ thì trả về 401
    if (err || !user) {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    return user;
  }
}
