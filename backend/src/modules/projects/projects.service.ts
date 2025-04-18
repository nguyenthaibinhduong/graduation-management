import { Project } from "src/entities/project.entity";
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { In, Like, Repository } from 'typeorm';
import { CreateProjectDto } from "./dto/create-project.dto";
import { Student } from "src/entities/student.entity";
import { Teacher } from "src/entities/teacher.entity";
import { Course } from "src/entities/course.entity";
import { throwError } from "rxjs";

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
async createProjectByStudent(projectDto: CreateProjectDto): Promise<Project> {
  const { student_id, teacher_id, ...data }: any = projectDto;

  // Lấy các thực thể liên quan
  const student = await this.projectRepository.manager.findOne(Student, {
    where: { id: student_id },
    relations: ['user', 'department'],
  });
  if (!student) throw new NotFoundException('Tài khoản bạn không hợp lệ');

  const teacher = await this.projectRepository.manager.findOne(Teacher, {
    where: { id: teacher_id },
    relations: ['user', 'department'],
  });
  if (!teacher) throw new NotFoundException('Giảng viên không tồn tại');
  if(teacher?.department?.id != student?.department?.id) throw new NotFoundException('Giảng viên không thuộc khoa cho phép')
  const course = await this.projectRepository.manager.findOne(Course, {
    where: { is_current: true },
  });
  const status = 'propose';
  
   try {
       const newProject = this.projectRepository.create({
              ...data,
              status,
              student,
              teacher,
              course,
            });
        const savedProject = await this.projectRepository.save(newProject);
        return Array.isArray(savedProject) ? savedProject[0] : savedProject;
    } catch (error) {
        throw new BadRequestException(`Lỗi khi đề xuất đề tài: ${error.message}`);
    }
  
  
  }
  
  async updateProjectByStudent(id: any ,projectDto: CreateProjectDto ): Promise<Project> {
    const { student_id, teacher_id, ...data }:any = projectDto;

    // 1. Tìm project hiện có
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['student', 'teacher', 'course'],
    });

    if (!project) throw new NotFoundException('Đề tài không tồn tại');
    if (project.student.id !== student_id) throw new NotFoundException('Bạn không có quyền cập nhật đề tài này');
     if (project.status !== "propose") throw new NotFoundException('Bạn không thể cập nhật đề tài tại thời điểm hiện tại');

    const student = await this.projectRepository.manager.findOne(Student, {
      where: { id: student_id },
      relations: ['user', 'department'],
    });
    if (!student) throw new NotFoundException('Tài khoản bạn không hợp lệ');

    const teacher = await this.projectRepository.manager.findOne(Teacher, {
      where: { id: teacher_id },
      relations: ['user', 'department'],
    });
    if (!teacher) throw new NotFoundException('Giảng viên không tồn tại');
    if (teacher.department?.id !== student.department?.id)
      throw new NotFoundException('Giảng viên không thuộc khoa cho phép');

    // 3. Cập nhật project
    project.title = data.title ?? project.title;
    project.description = data.description ?? project.description;
    project.status = 'propose';
    project.teacher = teacher;

    try {
      return await this.projectRepository.save(project);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi cập nhật đề tài: ${error.message}`);
    }
  }

  async deleteByStudent(ids: number[] | number, student_id: number): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids];
    const projects = await this.projectRepository.find({
      where: {
        id: In(idArray),
        student: { id: student_id },
        status: 'propose',
      },
      relations: ['student'],
    });

    if (projects.length === 0) {
      throw new NotFoundException('Không tìm thấy đề tài nào hợp lệ để xóa');
    }

    const validIds = projects.map(p => p.id);

    try {
      await this.projectRepository.delete(validIds);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xóa đề tài: ${error.message}`);
    }
  }



  
  

}