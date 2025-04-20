import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';
import {  Repository } from 'typeorm';


@Injectable()
export class EvaluationFormService extends BaseService<EvaluationForm> {
  constructor(
    @InjectRepository(EvaluationForm)
    private readonly enrollmentSessionRepository: Repository<EvaluationForm>,
  ) {
    super(enrollmentSessionRepository);
  }

  async getDatailEvaluation(id: string): Promise<EvaluationForm>{
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

}