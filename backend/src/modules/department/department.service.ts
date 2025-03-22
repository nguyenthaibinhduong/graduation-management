import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Department } from 'src/entities/department.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRespository: Repository<Department>,
  ) {
    super(departmentRespository);
  }
}
