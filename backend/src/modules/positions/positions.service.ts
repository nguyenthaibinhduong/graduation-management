import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Position } from 'src/entities/position.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PositionsService extends BaseService<Position> {
  constructor(
    @InjectRepository(Position)
    private readonly positionRepository: Repository<Position>,
  ) {
    super(positionRepository);
  }
}