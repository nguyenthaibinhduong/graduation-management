import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Course } from 'src/entities/course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CoursesService extends BaseService<Course> {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {
    super(courseRepository);
  }
}