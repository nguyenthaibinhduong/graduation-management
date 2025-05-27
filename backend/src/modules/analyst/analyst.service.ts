import { Injectable } from '@nestjs/common';
import { CreateAnalystDto } from './dto/create-analyst.dto';
import { UpdateAnalystDto } from './dto/update-analyst.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Department } from 'src/entities/department.entity';
import { Repository } from 'typeorm';
import { Teacher } from 'src/entities/teacher.entity';

@Injectable()
export class AnalystService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentReponsitory: Repository<Department>,
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
  ) {}

  async getAnalyst() {
    const departments = await this.departmentReponsitory.find({
      relations: ['students', 'teachers'],
    });
    
    const countPeopleDepartment = departments.map((department) => ({
      id: department.id,
      name: department.name,
      studentCount: department.students.length,
      teacherCount: department.teachers.length,
    }));
    const teachers: any = await this.teacherRepository.find({
      where: { active :true }, 
      relations: ['projects', 'user'],
    });
    
    
    
    const projectsByTeacher = teachers
    .map((teacher:any) => {
      const publicProjects = teacher.projects.filter(
        (project:any) => project.status === 'public',
      );
      return {
        id: teacher.id,
        name: teacher.user.fullname,
        projectCount: publicProjects.length,
      };
    })
    .sort((a:any, b:any) => b.projectCount - a.projectCount)
    .slice(0, 5);

    
    const data = {
      countPeopleDepartment, // bạn lấy từ đoạn code trước đã tối ưu
      projectsByTeacher,
    };
    
    return data;
  }

  
}
