import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { Position } from 'src/entities/position.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],
  controllers: [PositionsController],
  providers: [PositionsService],
})
export class PositionsModule {}
