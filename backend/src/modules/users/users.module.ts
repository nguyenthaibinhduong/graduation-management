import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { RefreshToken } from 'src/entities/refresh_token.entity';
import { LoginAttempt } from 'src/entities/login_attempts.entity';
import { JwtUtilityService } from 'src/common/jwtUtility.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, RefreshToken, LoginAttempt])],
  controllers: [UsersController],
  providers: [UsersService, JwtUtilityService],
  exports: [UsersService],
})
export class UsersModule {}
