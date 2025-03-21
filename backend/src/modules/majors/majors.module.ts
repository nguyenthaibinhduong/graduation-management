import { Module } from '@nestjs/common';
import { MajorsService } from './majors.service';
import { MajorsController } from './majors.controller';
import { Major } from 'src/entities/major.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Major])],
  controllers: [MajorsController],
  providers: [MajorsService],
})
export class MajorsModule {}
