import { Project } from "src/entities/project.entity";
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Like, Repository } from 'typeorm';

@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {
    super(projectRepository);
  }

async getAllProjectForObject(
  teacher_id: number,
  course_id?: number,
  student_id?: number,
  search?: string,
  limit?: number,
  page?: number,

): Promise<{ items: Project[]; total: number; limit?: number; page?: number; teacher_id?: number,course_id?: number,student_id?: number }> {
    const where: any = {
      teacher: { id: teacher_id },
      ...(course_id && { course: { id: course_id } }),
      ...(student_id && { student: { id: student_id } }),
    };

    if (search) {
      where.name = Like(`%${search}%`);
    }

    const options: any = {
      where,
    }

    if (limit && page) {
      options.take = limit;
      options.skip = (page - 1) * limit;
    }
    if (student_id) {
      options.relations = ['teacher','teacher.user', 'course'];
    } else if (teacher_id) { 
      options.relations = ['student','student.user','student.department', 'course'];
    } else {
      options.relations = ['teacher','teacher.user','student','student.user','student.department', 'course'];
    }
    const [items, total] = await this.projectRepository.findAndCount(options);
    items.forEach(item => {
      if (item.teacher?.user) {
        item.teacher.user = { id: item.teacher.user.id, fullname: item.teacher.user.fullname } as any;
      }
      if (item.student?.user) {
        item.student.user = { id: item.student.user.id, fullname: item.student.user.fullname } as any;
      }
    });

    return {
      items,
      total,
      ...(limit && { limit }),
      ...(page && { page }),
      teacher_id,
      student_id,
      course_id,
     
    };
  }
  
  

}