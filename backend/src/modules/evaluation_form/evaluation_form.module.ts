import { Module } from '@nestjs/common';
import { EvaluationFormService } from './evaluation_form.service';
import { EvaluationFormController } from './evaluation_form.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationForm } from 'src/entities/evaluation_form.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EvaluationForm])],
  controllers: [EvaluationFormController],
  providers: [EvaluationFormService],
})
export class EvaluationFormModule {}
