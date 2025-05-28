import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Committee } from 'src/entities/committee.entity';
import { Group } from 'src/entities/group.entity';
import { Project } from 'src/entities/project.entity';
import { Student } from 'src/entities/student.entity';
import { Teacher } from 'src/entities/teacher.entity';
import { User, UserRole } from 'src/entities/user.entity';
import { In, Like, Not, Repository } from 'typeorm';

@Injectable()
export class GroupsService extends BaseService<Group> {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {
    super(groupRepository);
  }

  async getAllGroup(
    status: string,
    department_id: number | string | null,
    search?: string,
    limit?: number,
    page?: number,
    orderBy: 'asc' | 'desc' = 'asc',
  ): Promise<{ items: any[]; total: number; limit?: number; page?: number }> {
    // Xây dựng điều kiện lọc
    const where: any = search
      ? [{ code: Like(`%${search}%`) }, { name: Like(`%${search}%`) }]
      : {};
    if (status) where.status = status;

    if (department_id) {
      where.department = { id: department_id };
    }

    const options: any = {
      where,
      order: {
        updated_at: orderBy,
      },
      relations: [
        'students',
        'students.user',
        'leader',
        'leader.user',
        'student_attemp',
        'student_attemp.user',
        'department',
        'project',
        'teacher',
        'teacher.user',
      ],
    };

    if (limit && page) {
      options.take = limit;
      options.skip = (page - 1) * limit;
    }

    const [data, total] = await this.groupRepository.findAndCount(options);
    const freshGroupInvite = await Promise.all(
      data.map((group) => this.freshData(group)),
    );
    const items = freshGroupInvite;
    return {
      items,
      total,
      ...(limit && { limit }),
      ...(page && { page }),
    };
  }

  async createGroup(data: any, user_id: any): Promise<Group> {
    if (!data?.student_codes || data.student_codes.length === 0) {
      throw new Error('Không thể tạo nhóm mà không có sinh viên');
    }

    // Lấy thông tin user hiện tại
    const user: any = await this.repository.manager.findOne(User, {
      where: { id: user_id },
      relations: ['student', 'student.department'],
    });

    if (!user?.student) {
      throw new Error('Không tìm thấy thông tin sinh viên');
    }

    const currentStudentCode = user.student.code;

    // Kiểm tra mã sinh viên hiện tại có nằm trong danh sách không
    if (!data.student_codes.includes(currentStudentCode)) {
      throw new Error('Bạn chỉ được tạo nhóm có chứa thông tin của bạn');
    }
    if (data.student_codes[1] == user.student?.code) {
      throw new Error('Mã số thành viên phải khác với mã số của bạn');
    }

    // Lấy danh sách sinh viên
    const students = await this.repository.manager.find(Student, {
      where: { code: In(data.student_codes) },
      relations: ['department', 'group'],
    });

    if (students.length !== data.student_codes.length) {
      throw new Error('Mã số thành viên không hợp lệ');
    }

    const radomcode1 = Math.floor(Math.random() * 999 + 1)
      .toString()
      .padStart(3, '0');
    const radomcode2 = Math.floor(Math.random() * 999 + 1)
      .toString()
      .padStart(3, '0');

    // Kiểm tra nhóm hiện tại của user
    const existGroup = await this.repository.manager.findOne(Group, {
      where: {
        status: In(['create', 'approved', 'pending']),
        leader: { id: user.student.id },
      },
      relations: ['leader'],
    });
    if (
      existGroup &&
      existGroup.total_member == 2 &&
      existGroup.students?.length > 1
    ) {
      throw new Error(
        'Nhóm đã đầy .Vui lòng hủy (rời) nhóm cũ để tạo nhóm mới hoặc mời thêm thành viên',
      );
    }

    // Nếu tạo nhóm chỉ có 1 người (bản thân)
    if (data.student_codes.length == 1) {
      const existGroupAttempt = await this.repository.manager.findOne(Group, {
        where: { students: { id: user.student.id }, status: 'pending' },
        relations: ['leader'],
      });

      if (existGroupAttempt) {
        throw new Error(
          'Bạn đã có nhóm. Vui lòng hủy (rời) nhóm cũ để tạo nhóm mới hoặc mời thêm thành viên',
        );
      }

      const newGroup = new Group();
      newGroup.name = data.name;
      newGroup.students = [user.student];
      newGroup.department = user.student.department;
      newGroup.code = `${radomcode1}${radomcode2}`;
      newGroup.status = 'pending';
      newGroup.leader = user.student;
      newGroup.total_member = 1;

      return this.groupRepository.save(newGroup);
    }

    // Nếu tạo nhóm có 2 thành viên
    if (data.student_codes.length === 2) {
      const secondStudent = students.find((s) => s.code !== currentStudentCode);

      if (!secondStudent) {
        throw new Error('Không tìm thấy sinh viên thứ hai');
      }

      if (secondStudent.group) {
        throw new Error(`Sinh viên có mã ${secondStudent.code} đã có nhóm`);
      }

      // Kiểm tra 2 người đã cùng nhóm khác chưa (double check)
      // const existed = await this.repository.manager
      //   .createQueryBuilder(Group, 'group')
      //   .innerJoin('group.student_attemp', 'student')
      //   .where('student.code IN (:...codes)', { codes: data.student_codes })
      //   .getOne();

      // if (existed) {
      //   throw new Error('Hai bạn đã có nhóm từ trước.');
      // }

      // Kiểm tra cùng khoa
      const departmentIds = students.map((s) => s.department?.id);
      const uniqueDepartments = [...new Set(departmentIds)];
      if (uniqueDepartments.length > 1) {
        const departmentNames = [
          ...new Set(
            students.map((s) => s.department?.name || 'Không xác định'),
          ),
        ];
        throw new Error(
          `Tất cả sinh viên phải cùng khoa. Đã phát hiện các khoa: ${departmentNames.join(', ')}`,
        );
      }

      // Nếu user đã có nhóm nhưng chỉ 1 thành viên => update nhóm
      if (existGroup) {
        if (existGroup.total_member === 1) {
          existGroup.name = data.name || existGroup.name;
          existGroup.status = 'create';
          existGroup.student_attemp = students;
          return this.groupRepository.save(existGroup);
        } else {
          throw new Error(
            'Nhóm đã đầy. Bạn không được mời thêm thành viên mới',
          );
        }
      }
      const existGroupAttempt = await this.repository.manager.findOne(Group, {
        where: { students: { id: user.student.id }, status: 'pending' },
        relations: ['leader'],
      });

      if (existGroupAttempt) {
        throw new Error(
          'Bạn đã có nhóm. Vui lòng rời nhóm cũ để tham gia nhóm mới',
        );
      }
      // Tạo nhóm mới với 2 người
      const newGroup = new Group();
      newGroup.name = data.name;
      newGroup.student_attemp = students;
      newGroup.department = user.student.department;
      newGroup.leader = user.student;
      newGroup.students = [user.student];
      newGroup.code = `${radomcode1}${radomcode2}`;
      newGroup.total_member = 1;

      return this.groupRepository.save(newGroup);
    }

    // Nếu số lượng thành viên khác 1 hoặc 2 => không hỗ trợ
    throw new Error('Chỉ hỗ trợ tạo nhóm 1 hoặc 2 thành viên');
  }

  async registerProject(
    groupId: number,
    projectId: number,
    userId: any,
  ): Promise<any> {
    const user = await this.check_exist_with_data(
      User,
      {
        where: {
          id: userId,
        },
      },
      null,
    );

    const group = await this.check_exist_with_data(
      Group,
      {
        where: { id: groupId },
      },
      'Nhóm không tồn tại ! Hãy đăng ký nhóm',
    );

    const project: any = await this.repository.manager.findOne('Project', {
      where: { id: projectId },
      relations: ['groups', 'teacher', 'teacher.user'],
    });

    if (!project) {
      throw new Error('Đề tài không tồn tại');
    }
    // if (project?.group?.length >= project.max_total_group) {
    //   throw new Error("Đề tài đã đầy");
    // }

    if (group?.status != 'approved' && user?.role == UserRole.STUDENT) {
      throw new Error('Nhóm không trong đợt đăng ký');
    }
    if (group?.project && user?.role == UserRole.STUDENT) {
      throw new Error('Nhóm đã đăng ký dự án trước đó');
    }
    if (project?.status != 'public') {
      throw new Error(`Đề tài không được đăng ký`);
    }
    if (project?.groups?.length == project.total_member) {
      throw new Error(
        `Đề tài đã quá số lượng đăng ký ! Vui lòng đăng ký đề tài hoặc liên hệ với giảng viên ${project?.teacher?.user?.fullname} đễ được hỗ trợ`,
      );
    }

    if (user?.role == UserRole.STUDENT) {
      group.project = project;
      group.teacher = project?.teacher;
      group.status = 'finding';
      return this.repository.save(group);
    } else if (user?.role == UserRole.ADMIN) {
      return this.repository.update(group?.id, {
        project,
      });
    }
  }

  async getGroupByUser(userId: number, type: string): Promise<any> {
    const user = await this.check_exist_with_data(
      User,
      {
        where: { id: userId },
        relations: ['student', 'teacher'],
      },
      'Tài khoản không hợp lệ',
    );

    if (user?.role == UserRole.STUDENT) {
      if (!user?.student) {
        throw new Error('Bạn không phải là sinh viên');
      }
      const studentId = user.student.id;
      if (type === 'leader') {
        // Lấy group có liên quan tới student (trong students hoặc student_attemp)
        const group = await this.repository.manager.findOne(Group, {
          where: [
            {
              students: { id: studentId },
              status: In([
                'create',
                'pending',
                'approved',
                'finding',
                'success',
              ]),
            },
            {
              student_attemp: { id: studentId },
              status: In(['pending', 'finding', 'success']),
            },
          ],
          relations: [
            'students',
            'students.user',
            'leader',
            'leader.user',
            'student_attemp',
            'student_attemp.user',
            'project',
            'committee',
          ],
        });

        if (!group) return null;

        const isLeader = group.leader?.id === studentId;

        if (isLeader) {
          // Nếu là leader thì được xem nhóm ở mọi trạng thái
          const fullGroup = await this.repository.manager.findOne(Group, {
            where: { id: group.id },
            relations: [
              'students',
              'students.user',
              'leader',
              'leader.user',
              'student_attemp',
              'student_attemp.user',
              'project',
              'committee',
            ],
          });
          return this.freshData(fullGroup);
        } else {
          // Không phải leader nhưng nằm trong group (students hoặc student_attemp) với status pending
          if (
            (group.status === 'pending' ||
              group.status === 'approved' ||
              group.status === 'finding' ||
              group.status === 'success') &&
            (group.students.some((s) => s.id === studentId) ||
              group.student_attemp.some((s) => s.id === studentId))
          ) {
            const fullGroup = await this.repository.manager.findOne(Group, {
              where: { id: group.id },
              relations: [
                'students',
                'students.user',
                'leader',
                'leader.user',
                'student_attemp',
                'student_attemp.user',
                'project',
                'committee',
              ],
            });
            return this.freshData(fullGroup);
          } else {
            return null;
          }
        }
      } else if (type === 'invite') {
        // Lấy các group mà student nằm trong student_attemp
        const groups = await this.repository.manager.find(Group, {
          where: {
            status: 'create',
            student_attemp: { id: studentId },
          },
          relations: [
            'students',
            'students.user',
            'leader',
            'leader.user',
            'student_attemp',
            'student_attemp.user',
          ],
        });

        // Lọc các group mà student KHÔNG phải là leader
        const filteredGroups = groups.filter((g) => g.leader?.id !== studentId);
        const result = await Promise.all(
          filteredGroups.map((g) => this.freshData(g)),
        );
        return result;
      }
    } else if (user?.role == UserRole.TEACHER) {
      const teacherId = user.teacher?.id;
      const teacher = await this.check_exist_with_data(
        Teacher,
        {
          where: {
            id: teacherId,
          },
        },
        'Giảng viên không tồn tại',
      );
      const groups = await this.repository.manager.find(Group, {
        where: {
          teacher: {
            id: teacher?.id,
          },
          status: 'success',
        },
        relations: [
          'students',
          'students.user',
          'leader',
          'department',
          'leader.user',
          'student_attemp',
          'student_attemp.user',
          'project',
        ],
      });
      return groups;
    }

    return null;
  }

  async lockGroup(department_id: any, userId: string) {
    const user = await this.check_exist_with_data(
      User,
      {
        where: { id: userId },
      },
      'Tài khoản không hợp lệ',
    );

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bạn không có quyền');
    }

    // Nếu có department_id
    if (department_id) {
      const allGroups = await this.groupRepository.find({
        where: { department: { id: department_id } },
      });

      const toApproveIds = allGroups
        .filter((group) => group.status === 'pending')
        .map((group) => group.id);

      const toDeleteIds = allGroups
        .filter(
          (group) =>
            !['pending', 'approved', 'finding', 'success'].includes(
              group.status,
            ),
        )
        .map((group) => group.id);

      if (toApproveIds.length > 0) {
        await this.groupRepository.update(
          { id: In(toApproveIds) },
          { status: 'approved' },
        );
      }

      if (toDeleteIds.length > 0) {
        await this.groupRepository.delete({ id: In(toDeleteIds) });
      }
    } else {
      throw new Error('Vui lòng chọn khoa cần khóa');
    }
  }

  async handleInviteResponse(userId: any, groupId: any, type: any) {
    const user = await this.check_exist_with_data(
      User,
      {
        where: { id: userId },
        relations: ['student'],
      },
      'Tài khoản không hợp lệ',
    );
    if (user?.student) {
      var student = await this.check_exist_with_data(
        Student,
        {
          where: { id: user?.student?.id },
          relations: { group: true },
        },
        'Sinh viên không tồn tại',
      );
    }
    const group = await this.check_exist_with_data(
      Group,
      {
        where: { id: groupId },
        relations: { leader: true },
      },
      'Nhóm không tồn tại',
    );
    if (
      group?.leader &&
      group?.leader?.id != user?.student.id &&
      group?.status == 'create'
    ) {
      const groupHas = await this.repository.manager.findOne(Group, {
        where: {
          id: group?.id,
          student_attemp: {
            id: user?.student?.id,
          },
        },
        relations: [
          'students',
          'students.user',
          'leader',
          'leader.user',
          'student_attemp',
          'student_attemp.user',
        ],
      });
      if (groupHas) {
        if (type == 'accept') {
          if (student?.group) {
            throw new Error(
              'Bạn đã có nhóm. Bạn cần hủy tham gia nhóm hiện tại để tham gia nhóm khác',
            );
          }
          groupHas.status = 'pending';
          groupHas.total_member = 2;
          groupHas.students = [groupHas.leader, user.student];
          return this.groupRepository.save(groupHas);
        } else {
          if (type == 'reject') {
            groupHas.status = 'pending';
            groupHas.total_member = 1;
            groupHas.students = [groupHas.leader];
            groupHas.student_attemp = [groupHas.leader];
            return this.groupRepository.save(groupHas);
          }
        }
      }
    } else {
      throw new Error('Yêu cầu không hợp lệ');
    }
  }

  async updateStatusGroup(userId: any, groupId: any, status?: any) {
    const userDta = await this.check_exist_with_data(
      User,
      {
        where: { id: userId },
      },
      'Tài khoản không hợp lệ',
    );
    const group = await this.check_exist_with_data(
      Group,
      {
        where: { id: groupId },
        relations: [
          'students',
          'students.user',
          'leader',
          'leader.user',
          'student_attemp',
          'student_attemp.user',
        ],
      },
      'Nhóm không tồn tại',
    );
    if (userDta.role == UserRole.STUDENT) {
      const user = await this.check_exist_with_data(
        User,
        {
          where: { id: userDta?.id },
          relations: { student: true },
        },
        'Tài khoản không hợp lệ',
      );
      if (['approved', 'finding', 'success'].includes(group?.status)) {
        throw new Error('Không thể Hủy nhóm trong trạng thái này');
      }
      if (
        group?.leader &&
        group?.leader?.id == user?.student?.id &&
        group?.status != 'approved' &&
        group?.total_member == 1
      ) {
        group.status = 'rejected';
        group.student_attemp = [];
        group.total_member = 1;
        group.students = [];
        return this.groupRepository.save(group);
      } else if (
        group?.leader &&
        group?.leader?.id != user?.student?.id &&
        group?.status != 'approved'
      ) {
        const groupHas = await this.repository.manager.findOne(Group, {
          where: {
            id: group?.id,
            students: {
              id: user?.student?.id,
            },
          },
          relations: [
            'students',
            'students.user',
            'leader',
            'leader.user',
            'student_attemp',
            'student_attemp.user',
          ],
        });
        if (groupHas && groupHas.leader) {
          groupHas.students = [group?.leader];
          groupHas.student_attemp = [group?.leader];
          groupHas.status = 'pending';
          groupHas.total_member = 1;
          return this.groupRepository.save(groupHas);
        }
      } else if (
        group?.leader &&
        group?.leader?.id == user?.student?.id &&
        group?.status != 'approved' &&
        group.total_member == 2
      ) {
        throw new Error(
          'Thành viên khác cần rời nhóm để hủy nhóm, Hoặc liên hệ giáo vụ để giải quyết',
        );
      } else {
        throw new Error('Lỗi ! liên hệ giáo vụ để giải quyết');
      }
    } else if (userDta.role == UserRole.ADMIN) {
      if (
        status == 'rejected' ||
        status == 'create' ||
        status == 'pending' ||
        status == 'approved' ||
        status == 'finding' ||
        status == 'success'
      ) {
        return await this.groupRepository.update(group?.id, { status });
      }
    } else {
      throw new ForbiddenException('Bạn đủ có quyền hạn!');
    }
  }

  async changeTeacher(teacher_code: any, groupId: any) {
    const group = await this.check_exist_with_data(
      Group,
      {
        where: { id: groupId, status: In(['public', 'finding', 'success']) },
      },
      'Nhóm không hợp lệ',
    );
    const teacher = await this.check_exist_with_data(
      Teacher,
      {
        where: { code: teacher_code },
      },
      'Giáo viên không hợp lệ',
    );
    group.teacher = teacher;
    return this.groupRepository.save(group);
  }

  async stopProject(groupId: any, projectId: any) {
    const project = await this.check_exist_with_data(
      Project,
      {
        where: { id: projectId },
      },
      'Đề tài không hợp lệ',
    );
    const group: any = await this.check_exist_with_data(
      Group,
      {
        where: {
          id: groupId,
          status: In(['finding']),
          project: { id: project?.id },
        },
      },
      'Nhóm không hợp lệ',
    );
    group.project = null;
    group.status = 'approved';
    await this.groupRepository.save(group);
  }

  freshData(data: any) {
    if (data?.students) {
      data.students = data.students.map((student: any) => {
        delete student.created_at;
        delete student.updated_at;
        return {
          ...student,
          user: {
            id: student.user?.id,
            fullname: student.user?.fullname,
          },
        };
      });
    }

    if (data?.student_attemp) {
      data.student_attemp = data.student_attemp.map((student: any) => {
        delete student.created_at;
        delete student.updated_at;
        return {
          ...student,
          user: {
            id: student.user?.id,
            fullname: student.user?.fullname,
          },
        };
      });
    }
    if (data?.leader) {
      delete data.leader.created_at;
      delete data.leader.updated_at;
      data.leader = {
        ...data.leader,
        user: {
          id: data.leader.user?.id,
          fullname: data.leader.user?.fullname,
        },
      };
    }
    if (data?.teacher) {
      delete data.teacher.created_at;
      delete data.teacher.updated_at;
      data.teacher = {
        ...data.teacher,
        user: {
          id: data.teacher.user?.id,
          fullname: data.teacher.user?.fullname,
        },
      };
    }
    return data;
  }

  //Assign teacher manually (advisor, reviewer, committee)

  async assignReviewer(groupId: number, teacherId: number) {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['department', 'teacher', 'facultyReviewers'],
    });
    if (!group) throw new Error('Nhóm không tồn tại');

    const teacher = await this.repository.manager.findOne(Teacher, {
      where: { id: teacherId, department: { id: group.department.id } },
    });
    if (!teacher)
      throw new Error('Giáo viên không hợp lệ hoặc không cùng khoa');

    if (group.teacher && group.teacher.id === teacherId) {
      throw new Error(
        'Giáo viên hướng dẫn không thể là phản biện của nhóm này',
      );
    }

    if (group.facultyReviewers?.some((t) => t.id === teacherId)) {
      throw new Error('Giáo viên này đã là phản biện của nhóm');
    }

    group.facultyReviewers = [...(group.facultyReviewers || []), teacher];
    await this.groupRepository.save(group);

    return {
      message: 'Gán giáo viên phản biện thành công',
      groupId,
      teacherId,
    };
  }

  async assignCommittee(groupId: number, committeeId: number): Promise<any> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId },
      relations: ['department', 'committee', 'teacher'],
    });
    if (!group) throw new Error('Nhóm không tồn tại');

    const committee = await this.repository.manager.findOne(Committee, {
      where: { id: committeeId },
      relations: ['department', 'teachers'],
    });
    if (!committee) throw new Error('Hội đồng không tồn tại');

    if (
      !group.department ||
      !committee.department ||
      group.department.id !== committee.department.id
    ) {
      throw new Error('Nhóm và hội đồng phải cùng khoa');
    }

    if (
      group.teacher &&
      committee.teachers?.some((t: any) => t.id === group.teacher.id)
    ) {
      throw new Error(
        'Thành viên hội đồng không được trùng với giáo viên hướng dẫn của nhóm',
      );
    }

    group.committee = committee;
    await this.groupRepository.save(group);

    return {
      message: 'Gán hội đồng cho nhóm thành công',
      groupId,
      committeeId,
    };
  }
}
