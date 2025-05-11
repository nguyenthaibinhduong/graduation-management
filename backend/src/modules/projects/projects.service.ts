
import { EnrollmentSession } from 'src/entities/enrollment_session.entity';
import { Project } from 'src/entities/project.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { In, Like, Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { Course } from 'src/entities/course.entity';
import { User, UserRole } from 'src/entities/user.entity';
import { JwtUtilityService } from 'src/common/jwtUtility.service';
import { Roles } from 'src/common/decorators/roles.decorators';
@Injectable()
export class ProjectsService extends BaseService<Project> {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly jwtUtilityService: JwtUtilityService,
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
    status?: string,
  ): Promise<{
    items: Project[];
    total: number;
    limit?: number;
    page?: number;
    teacher_id?: number;
    course_id?: number;
    student_id?: number;
  }> {
    let where: any = {};
    if (status === 'public' && student_id) {
      const student = await this.repository.manager.findOne(Student, {
        where: { id: student_id },
        relations: { department: true },
      });
      if (!student) throw new NotFoundException('Không có quyền truy cập ');
      where = {
        session: { department: { id: student?.department?.id } },
        ...(course_id && { course: { id: course_id } }),
      };
    } else {
      where = {
        teacher: { id: teacher_id },
        ...(course_id && { course: { id: course_id } }),
        ...(student_id && { student: { id: student_id } }),
      };
    }

    if (search) {
      where.title = Like(`%${search}%`);
    }

    const options: any = {
      where,
    };

    if (
      typeof limit === 'number' &&
      typeof page === 'number' &&
      !isNaN(limit) &&
      !isNaN(page)
    ) {
      options.take = limit;
      options.skip = (page - 1) * limit;
    }
    if (student_id) {
      options.relations = ['teacher', 'teacher.user', 'course'];
      where.status = status
        ? status
        : In(['propose', 'pending', 'approve', 'public']);
    } else if (teacher_id) {
      options.relations = [
        'student',
        'teacher',
        'student.user',
        'student.department',
        'course',
      ];
      where.status = status
        ? status
        : In(['propose', 'pending', 'approve', 'public']);
    } else {
      options.relations = [
        'teacher',
        'teacher.user',
        'student',
        'student.user',
        'student.department',
        'course',
      ];
      where.status = status
        ? status
        : In(['pending', 'approve', 'public', 'propose']);
    }
    const [items, total] = await this.projectRepository.findAndCount(options);
    items.forEach((item) => {
      if (item.teacher?.user) {
        item.teacher.user = {
          id: item.teacher.user.id,
          fullname: item.teacher.user.fullname,
        } as any;
      }
      if (item.student?.user) {
        item.student.user = {
          id: item.student.user.id,
          fullname: item.student.user.fullname,
        } as any;
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
  async createProject(dto: CreateProjectDto, type: string): Promise<Project> {
    try {
      const { teacher_id, student_id, ...data }: any = dto;
      const teacher = await this.projectRepository.manager.findOne(Teacher, {
        where: { id: teacher_id },
        relations: ['user', 'department'],
      });
      if (!teacher) throw new NotFoundException('Giảng viên không tồn tại');

      let student = null;
      if (type === 'student') {
        student = await this.projectRepository.manager.findOne(Student, {
          where: { id: student_id },
          relations: ['user', 'department'],
        });
        if (!student) throw new NotFoundException('Sinh viên không tồn tại');
        if (student.department?.id !== teacher.department?.id)
          throw new NotFoundException('Giảng viên không cùng khoa');
      }

      const course = await this.projectRepository.manager.findOne(Course, {
        where: { is_current: true },
      });

      const project = this.projectRepository.create({
        ...data,
        status: 'propose',
        teacher,
        course,
        ...(type === 'student' && student && { student }),
      });

      const savedProject = await this.projectRepository.save(project);
      return Array.isArray(savedProject) ? savedProject[0] : savedProject;
    } catch (e) {
      throw new BadRequestException(`Lỗi đề xuất đề tài: ${e.message}`);
    }
  }

  async updateProject(
    id: any,
    dto: CreateProjectDto,
    type: string,
  ): Promise<Project> {
    const { student_id, teacher_id, title, description, content }: any = dto;

    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['student', 'teacher', 'course'],
    });
    if (!project) throw new NotFoundException('Đề tài không tồn tại');
    if (type === 'student' && project.student?.id !== student_id)
      throw new NotFoundException('Không có quyền cập nhật');
    if (type === 'teacher' && project.teacher?.id !== teacher_id)
      throw new NotFoundException('Không có quyền cập nhật');
    if (project.status !== 'propose')
      throw new BadRequestException('Không thể cập nhật ở trạng thái này');

    if (type === 'student') {
      const [student, teacher] = await Promise.all([
        this.projectRepository.manager.findOne(Student, {
          where: { id: student_id },
          relations: ['user', 'department'],
        }),
        this.projectRepository.manager.findOne(Teacher, {
          where: { id: teacher_id },
          relations: ['user', 'department'],
        }),
      ]);

      if (!student) throw new NotFoundException('Sinh viên không hợp lệ');
      if (!teacher) throw new NotFoundException('Giảng viên không tồn tại');
      if (student.department?.id !== teacher.department?.id)
        throw new NotFoundException('Giảng viên không cùng khoa');

      Object.assign(project, {
        title: title ?? project.title,
        description: description ?? project.description,
        teacher,
        status: 'propose',
      });
    } else if (type === 'teacher') {
      const [teacher] = await Promise.all([
        this.projectRepository.manager.findOne(Teacher, {
          where: { id: teacher_id },
          relations: ['user', 'department'],
        }),
      ]);
      if (!teacher) throw new NotFoundException('Giảng viên không tồn tại');

      Object.assign(project, {
        title: title ?? project.title,
        description: description ?? project.description,
        content: content ?? project.content,
        teacher,
        status: 'propose',
      });
    }

    try {
      return await this.projectRepository.save(project);
    } catch (e) {
      throw new BadRequestException(`Lỗi cập nhật đề tài: ${e.message}`);
    }
  }

  async getProjectById(
    id: any,
    type: string,
    user:any
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
        student: { user: true },
        teacher: { user: true },
        course: true,
      },
    });
    const userProject = await this.repository.manager.findOne(User, {
      where: { id: user?.id },
      relations: {
        student:true ,
        teacher:true ,
      },
    })
    if (!project) throw new NotFoundException('Đề tài không tồn tại');
    if (user.role == UserRole.STUDENT) {
      if (type === 'student' &&project.student?.id != userProject?.student?.id &&  project?.status != 'public')
        throw new NotFoundException('Không có quyền truy cập đề tài này');
      if (project.student?.user) {
        project.student.user = {
          id: project.student.user.id,
          fullname: project.student.user.fullname,
        } as any;
      }
      return project;
      
    } else if (user.role == UserRole.TEACHER) {
      if (type === 'teacher' && project.teacher?.id != userProject?.teacher?.id)
        throw new NotFoundException('Không có quyền truy cập đề tài này');
      if (project.teacher?.user) {
        project.teacher.user = {
          id: project.teacher.user.id,
          fullname: project.teacher.user.fullname,
        } as any;
      }
      return project;
      
    } else if (user.role == UserRole.ADMIN) {
      return project;
    } else {
      throw new NotFoundException('Không có quyền truy cập đề tài này');
    }
  }

  async updateStatus(data: any, type: string): Promise<void> {
    try {
      const { id, status, obj_id } = data;

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          student: true,
          teacher: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Đề tài không tồn tại');
      }
      if (type != 'admin') {
        if (type === 'student' && project.student?.id !== obj_id) {
          throw new NotFoundException('Không có quyền truy cập đề tài này');
        }

        if (type === 'teacher' && project.teacher?.id !== obj_id) {
          throw new NotFoundException('Không có quyền truy cập đề tài này');
        }
      }

      // Cập nhật trạng thái
      project.status = status;
      await this.projectRepository.save(project);
    } catch (error) {
      throw new BadRequestException(`Lỗi: ${error.message}`);
    }
  }

  async publicProject(data: any, type: string, user_id:any): Promise<void> {
    try {
      const { id, session_id }: any = data;

      const user = await this.projectRepository.manager.findOne(User, {
        where: { id: user_id },
      });

      if (!user || user.role !== 'admin' || type !== 'admin') {
        throw new UnauthorizedException(
          'Bạn không có quyền thực hiện hành động này',
        );
      }

      const project = await this.projectRepository.findOne({
        where: { id, status: 'approve' },
      });
      if (!project) {
        throw new NotFoundException('Đề tài không hợp lệ hoặc chưa được duyệt');
      }

      const session = await this.projectRepository.manager.findOne(
        EnrollmentSession,
        {
          where: { id: session_id },
        },
      );
      if (!session) {
        throw new NotFoundException('Đợt đăng ký không tồn tại');
      }

      project.status = 'public';
      project.session = session;
      await this.projectRepository.save(project);
    } catch (error) {
      throw new InternalServerErrorException(`Lỗi hệ thống: ${error.message}`);
    }
  }

  async deleteProject(
    ids: number[] | number,
    obj_id: number,
    type: string,
  ): Promise<void> {
    const idArray = Array.isArray(ids) ? ids : [ids];
    if (type === 'student') {
      var projects = await this.projectRepository.find({
        where: {
          id: In(idArray),
          student: { id: obj_id },
          status: 'propose',
        },
        relations: ['student'],
      });
    } else if (type === 'teacher') {
      var projects = await this.projectRepository.find({
        where: {
          id: In(idArray),
          teacher: { id: obj_id },
          status: 'propose',
        },
        relations: ['teacher'],
      });
    }

    if (projects.length === 0) {
      throw new NotFoundException('Đề tài đang ở trạng thái không thể xóa');
    }

    const validIds = projects.map((p) => p.id);

    try {
      await this.projectRepository.delete(validIds);
    } catch (error) {
      throw new BadRequestException(`Lỗi khi xóa đề tài: ${error.message}`);
    }
  }
}
