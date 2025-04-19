import { Module } from '@nestjs/common';
import { CommitteesService } from './committees.service';
import { CommitteesController } from './committees.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Committee } from 'src/entities/committee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Committee])],
  controllers: [CommitteesController],
  providers: [CommitteesService],
})
export class CommitteesModule {}
