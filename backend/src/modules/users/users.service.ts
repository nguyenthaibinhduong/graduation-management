import { ConflictException, Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base.service';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { LoginAttempt } from 'src/entities/login_attempts.entity';
import axios from 'axios';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
     @InjectRepository(LoginAttempt)
        private readonly loginAttemptRepository: Repository<LoginAttempt>,
  ) {
    super(userRepository);
  }

  async getLoginAttempt(username: string, ipAddress: string): Promise<LoginAttempt> {
  let loginAttempt = await this.loginAttemptRepository.findOne({ where: { username, ip_address: ipAddress } });

  if (!loginAttempt) {
    loginAttempt = this.loginAttemptRepository.create({
      username,
      ip_address: ipAddress,
    });
    await this.loginAttemptRepository.save(loginAttempt);
  }

  return loginAttempt;
  }
  async resetFailedAttempts(username: string, ipAddress: string): Promise<void> {
    const loginAttempt = await this.getLoginAttempt(username, ipAddress);

    if (loginAttempt) {
      // Reset số lần đăng nhập sai và thời gian lỗi cuối cùng
      loginAttempt.failed_attempts = 0;
      loginAttempt.last_failed_at = null;
      loginAttempt.locked_until = null; // Hủy thời gian khóa tài khoản nếu có

      // Lưu lại thông tin vào cơ sở dữ liệu
      await this.loginAttemptRepository.save(loginAttempt);
    }
  }




  async incrementFailedAttempts(username: string, ipAddress: string): Promise<void> {
    const loginAttempt = await this.getLoginAttempt(username, ipAddress);

    // Nếu đã vượt quá 3 lần đăng nhập sai, khóa tài khoản 15 phút
    loginAttempt.failed_attempts += 1;
    loginAttempt.last_failed_at = new Date();

    if (loginAttempt.failed_attempts >= 3) {
      loginAttempt.locked_until = new Date(Date.now() + 15 * 60 * 1000);

    }

    await this.loginAttemptRepository.save(loginAttempt);
  }
  





  async register(userData: Partial<User>): Promise<any> {
    const user = this.userRepository.create(userData);
    const hashPassword = await bcrypt.hash(userData.password, 10);
    user.password = hashPassword;
    return this.userRepository.save(user);
  }
  // async findByEmail(email: string) {
  //   const user = await this.userRepository.findOneBy({ email });
  //   return user;
  // }





  async findByUsername(username: string) {
    const user = await this.userRepository.findOneBy({ username });
    return user;
  }


  async validateUser(username: string, password: string, ipAddress: string, captchaResponse: string) {
    if(!captchaResponse)  throw new Error('Chưa xác minh không phải robot');
    const isCaptchaValid = await this.verifyCaptcha(captchaResponse);
    if (!isCaptchaValid) {
      throw new Error('CAPTCHA không hợp lệ. Vui lòng thử lại.');
    }
    // Lấy thông tin về các lần đăng nhập của người dùng từ cơ sở dữ liệu
    const loginAttempt = await this.getLoginAttempt(username, ipAddress);

    // Nếu tài khoản bị khóa, trả về thông báo lỗi
    if (loginAttempt.locked_until && new Date() < new Date(loginAttempt.locked_until)) {
      throw new Error('Tài khoản đã bị khóa tạm thời , Hãy thử lại sau !');
    }

    // Tìm người dùng theo tên người dùng
    const user = await this.findByUsername(username);
    if (!user) {
      // Nếu không tìm thấy người dùng, không cần tăng số lần đăng nhập sai
      return null;
    }

    // So sánh mật khẩu với giá trị trong cơ sở dữ liệu
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      // Đăng nhập thành công, reset số lần đăng nhập sai
      await this.resetFailedAttempts(username, ipAddress);
      return user;
    } else {
      // Đăng nhập sai, tăng số lần đăng nhập sai
      await this.incrementFailedAttempts(username, ipAddress);
      return null;
    }
  }

  async verifyCaptcha(captchaResponse: string): Promise<boolean> {
  const secretKey = '6LfrVyYrAAAAAN6leFm5NXusLn3N8IyuVqWtI3mS'; // Thay thế bằng key của bạn
  const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
    params: {
      secret: secretKey,
      response: captchaResponse,
    },
  });

  return response.data.success;
}

  async saveRefreshToken(
    refreshToken: string,
    userId: number,
    expiresIn: number,
  ) {
    const hashedToken = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const refresh_token = this.refreshTokenRepository.create({
      token: hashedToken,
      user: user,
      expires_at: expiresAt,
    });

    return await this.refreshTokenRepository.save(refresh_token);
  }

  async verifyRefreshToken(refreshToken: string, userId: number) {
    const tokens = await this.refreshTokenRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!tokens.length) {
      return false;
    }
    for (const storedToken of tokens) {
      if (new Date() > storedToken.expires_at) {
        await this.refreshTokenRepository.delete(storedToken.id);
        continue;
      }
      if (await bcrypt.compare(refreshToken, storedToken.token)) {
        return storedToken.user;
      }
    }

    return false;
  }

  async deleteRefreshToken(userId: number): Promise<void> {
    await this.refreshTokenRepository.delete({ user: { id: userId } });
  }

  async getAllUser(
    role?: string,
    search?: string,
    limit?: number,
    page?: number,
  ): Promise<{ items: User[]; total: number; limit?: number; page?: number }> {
    const where = search
      ? [{ fullname: Like(`%${search}%`) }]
      : role
        ? { role }
        : {};
    const options: any = { where };
    if (limit && page) {
      options.take = limit;
      options.skip = (page - 1) * limit;
    }
    const items = await this.repository.find(options);
    const total = await this.repository.count();

    return { items, total, ...(limit && { limit }), ...(page && { page }) };
  }

  async getUserDetails(user: any): Promise<any> {
    const userData = await this.userRepository.findOne({
      where: { id: user.id },
      relations: {
        teacher: user.role === 'teacher',
        student:
          user.role === 'student' ? { department: true, major: true } : false,
      },
    });
    return userData;
  }

  async updatePassword(
    id: number,
    oldpassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('Không tìm thấy nguời dùng');
    }
    const isMatch = await bcrypt.compare(oldpassword, user.password);
    if (!isMatch) {
      throw new ConflictException('Mật khẩu cũ không đúng');
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    return this.userRepository.save(user);
  }
}
