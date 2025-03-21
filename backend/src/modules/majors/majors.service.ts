import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Major } from 'src/entities/major.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MajorsService extends BaseService<Major> {
  constructor(
    @InjectRepository(Major)
    private readonly majorRepository: Repository<Major>,
  ) {
    super(majorRepository);
  }
}