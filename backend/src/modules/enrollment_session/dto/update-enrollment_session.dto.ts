import { PartialType } from '@nestjs/mapped-types';
import { CreateEnrollmentSessionDto } from './create-enrollment_session.dto';

export class UpdateEnrollmentSessionDto extends PartialType(CreateEnrollmentSessionDto) {}
