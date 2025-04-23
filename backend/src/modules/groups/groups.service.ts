import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Group } from 'src/entities/group.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class GroupsService extends BaseService<Group> {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {
    super(groupRepository);
  }

  async createGroup(data: any,user_id:any): Promise<Group> {
    if (!data?.student_codes || data.student_codes.length === 0) {
      throw new Error('Không thể thêm nhóm mà không có sinh viên');
    }
    const user:any = await this.repository.manager.findOne(User, {
      where: { id: user_id },
      relations : {student:true}
    })
     
    if (!data.student_codes.includes(user?.student?.code)) {
      throw new Error('Bạn chỉ được thêm nhóm có thông tin của bạn');
    }
    // Find students by their codes
    const students = await this.repository.manager.find(Student, {
      where: { code: In(data.student_codes) },
      relations: { department: true, group: true }, // Ensure department and group relations are loaded
    });

    // Check if all provided student codes exist
    if (students.length !== data.student_codes.length) {
      const foundCodes = students.map((s) => s.code);
      const missingCodes = data.student_codes.filter(
        (code: string) => !foundCodes.includes(code),
      );
      throw new Error(
        `Sinh viên  mã  ${missingCodes.join(', ')}` + ' không tồn tại',
      );
    }

    // Check if any students are already in a group
    const studentsWithGroup = students.filter((student) => student.group);
    if (studentsWithGroup.length > 0) {
      const studentCodes = studentsWithGroup.map((s) => s.code);
      throw new Error(
        `Các sinh viên sau đã có nhóm: ${studentCodes.join(', ')}`,
      );
    }

    // Ensure all students belong to the same department
    const departmentIds = students.map((s) => s.department?.id);
    const uniqueDepartmentIds = [...new Set(departmentIds)];

    if (uniqueDepartmentIds.length > 1) {
      const departmentNames = students.map(
        (s) => s.department?.name || 'Không xác định',
      );
      const uniqueDepartmentNames = [...new Set(departmentNames)];
      throw new Error(
        `Tất cả sinh viên phải thuộc cùng một khoa. Đã phát hiện các khoa: ${uniqueDepartmentNames.join(', ')}`,
      );
    }

    // Create a new group
    const newGroup = new Group();
    newGroup.name = data.name;
    newGroup.students = students;
    newGroup.total_member = students.length;

    return this.groupRepository.save(newGroup);
  }

  async registerProject(groupId: number, projectId: number): Promise<any> {
    const group = await this.repository.findOne({
      where: { id: groupId },
      relations: { project: true },
    });
    const project = await this.repository.manager.findOne('Project', {
      where: { id: projectId },
    });
    if (!project) {
      throw new Error('Dự án không tồn tại');
    }
    if (!group) {
      throw new Error('Nhóm không tồn tại');
    }
    if (group.project) {
      throw new Error('Nhóm đã đăng ký dự án trước đó');
    }

    group.project = { id: projectId } as any;

    return this.repository.save(group);
  }
  async getGroupByUserId(userId: number): Promise<Group> {
    const student = await this.repository.manager.findOne(Student, {
      where: { id: userId },
      relations: { group: true },
    });
    if (!student) {
      throw new Error('Sinh viên không tồn tại');
    }
    return student.group ?? null; // Null = chưa có nhóm
  }
}
