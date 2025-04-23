import { Criteria } from "./../../entities/criteria.entity";
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import {  DeepPartial, In, Repository } from 'typeorm';


@Injectable()
export class EvaluationFormService extends BaseService<EvaluationForm> {
  constructor(
    @InjectRepository(EvaluationForm)
    private readonly enrollmentSessionRepository: Repository<EvaluationForm>,
  ) {
    super(enrollmentSessionRepository);
  }

  async getDatailEvaluation(id: string | number): Promise<EvaluationForm>{
    try {
      const options:any = {
        where: { id },
        relations: {
          criteria:true
        }
      }
       return this.repository.findOne(options)
    } catch (e) {
      throw new BadRequestException("Lỗi " + e.message)
    }
  }
  async createEvaluation(data: any): Promise<void> {
    const { criteria_ids, ...others } = data;

    // 1. Validate
    if (!others.title) {
      throw new Error('Vui lòng nhập tiêu đề');
    }

    // 2. Lấy tiêu chí (nếu cần)
    let criteria: Criteria[] = [];
    if (Array.isArray(criteria_ids) && criteria_ids.length) {
      criteria = await this.repository.manager.find(Criteria, {
        where: { id: In(criteria_ids) },
      });
    }

    // 3. Tạo Evaluation
    const evaluation = this.repository.create({
      ...others,
      criteria,               // gán quan hệ Many‑to‑Many/One‑to‑Many tuỳ thiết kế
    });

    await this.repository.save(evaluation);
  }


}