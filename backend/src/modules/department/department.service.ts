import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Department } from 'src/entities/department.entity';
import { Like, Repository } from 'typeorm';

@Injectable()
export class DepartmentService extends BaseService<Department> {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRespository: Repository<Department>,
  ) {
    super(departmentRespository);
  }
  async getAllDepartment(
      search?: string,
      limit?: number,
      page?: number,
    ): Promise<{ items: Department[]; total: number; limit?: number; page?: number }> {
      const where = search ? { name: Like(`%${search}%`) } : {};
      const options: any = { where };
      if (limit && page) {
        options.take = limit;
        options.skip = (page - 1) * limit;
      }
      const items = await this.repository.find({...options,relations: {
          major: true,
      }});
      const total = await this.repository.count();
  
      return { items, total, ...(limit && { limit }), ...(page && { page }) };
    }
}
