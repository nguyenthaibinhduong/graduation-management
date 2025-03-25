import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/base.service';
import { User } from 'src/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RefreshToken } from 'src/entities/refresh_token.entity';

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {
    super(userRepository);
  }
  async register(userData: Partial<User>): Promise<any> {
    const user = this.userRepository.create(userData);
    const hashPassword = await bcrypt.hash(userData.password, 10);
    user.password = hashPassword;
    return this.userRepository.save(user);
  }
  async findByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }
  async validateUser(email: string, password: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      return null;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    return isMatch ? user : null;
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
      role ?:string,
      search?: string,
      limit?: number,
      page?: number,
    ): Promise<{ items: User[]; total: number; limit?: number; page?: number }> {
      const where = search ? [
        { firstName: Like(`%${search}%`) },
        { lastName: Like(`%${search}%`) },
      ] :
        role
    ? { role }
    : {};
      const options: any = { where};
      if (limit && page) {
        options.take = limit;
        options.skip = (page - 1) * limit;
      }
      const items = await this.repository.find(options);
      const total = await this.repository.count();
  
      return { items, total, ...(limit && { limit }), ...(page && { page }) };
    }
}
