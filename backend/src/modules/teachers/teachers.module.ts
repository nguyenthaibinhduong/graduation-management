import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/entities/teacher.entity';
import { User } from 'src/entities/user.entity';
import { Position } from 'src/entities/position.entity';
import { Department } from 'src/entities/department.entity';
import { JwtUtilityService } from 'src/common/jwtUtility.service';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User, Position, Department])],
  controllers: [TeachersController],
  providers: [TeachersService, JwtUtilityService],
})
export class TeachersModule {}
