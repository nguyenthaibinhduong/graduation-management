import { Injectable } from '@nestjs/common';
import { CreateCommitteeDto } from './dto/create-committee.dto';
import { UpdateCommitteeDto } from './dto/update-committee.dto';
import { BaseService } from 'src/common/base.service';
import { Committee } from 'src/entities/committee.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CommitteesService extends BaseService<Committee> {
  constructor(
    @InjectRepository(Committee)
    private readonly committeeRepository: Repository<Committee>,
  ) {
    super(committeeRepository);
  }
}
