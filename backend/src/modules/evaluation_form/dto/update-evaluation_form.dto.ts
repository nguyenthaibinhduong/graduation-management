import { PartialType } from '@nestjs/mapped-types';
import { CreateEvaluationFormDto } from './create-evaluation_form.dto';

export class UpdateEvaluationFormDto extends PartialType(CreateEvaluationFormDto) {}
