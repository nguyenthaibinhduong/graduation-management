import { PartialType } from '@nestjs/mapped-types';
import { CreateAnalystDto } from './create-analyst.dto';

export class UpdateAnalystDto extends PartialType(CreateAnalystDto) {}
