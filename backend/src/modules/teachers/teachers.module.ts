import { Module } from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { TeachersController } from './teachers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from 'src/entities/teacher.entity';
import { User } from 'src/entities/user.entity';
import { Position } from 'src/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Teacher, User, Position])],
  controllers: [TeachersController],
  providers: [TeachersService],
})
export class TeachersModule {}
