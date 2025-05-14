import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Criteria } from 'src/entities/criteria.entity';
import {  Repository } from 'typeorm';

@Injectable()
export class CriteriaService extends BaseService<Criteria> {
  constructor(
    @InjectRepository(Criteria)
    private readonly criteriaRespository: Repository<Criteria>,
  ) {
    super(criteriaRespository);
  }
}
