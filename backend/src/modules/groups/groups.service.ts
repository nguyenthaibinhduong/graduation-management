
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Department } from 'src/entities/department.entity';
import { Group } from 'src/entities/group.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
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
  const where: any = {};
 if (search) {
  where.push(
    { code: Like(`%${search}%`) },
    { name: Like(`%${search}%`) }
  );
}
  if (status) where.status = status;
  
  if (department_id) {
    where.department = { id: department_id };
  }


  const options: any = {
    where,
    order: {
      updated_at: orderBy,
    },
    relations:{department:true}
  };

  if (limit && page) {
    options.take = limit;
    options.skip = (page - 1) * limit;
  }

  const [items, total] = await this.groupRepository.findAndCount(options);

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
       throw new Error("Mã số thành viên phải khác với mã số của bạn")
  }

  // Lấy danh sách sinh viên
  const students = await this.repository.manager.find(Student, {
    where: { code: In(data.student_codes) },
    relations: ['department', 'group'],
  });

  if (students.length !== data.student_codes.length) {
    throw new Error('Mã số thành viên không hợp lệ');
  }

  const radomcode1 = Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');
  const radomcode2 = Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');

  // Kiểm tra nhóm hiện tại của user
  const existGroup = await this.repository.manager.findOne(Group, {
    where: { leader: { id: user.student.id } },
    relations: ['leader'],
  });

  // Nếu tạo nhóm chỉ có 1 người (bản thân)
  if (data.student_codes.length === 1) {
    const existGroupAttempt = await this.repository.manager.findOne(Group, {
      where: { students: { id: user.student.id }, status:'pending' },
      relations: ['leader'],
    });

    if (existGroupAttempt) {
      throw new Error('Bạn đã có nhóm. Vui lòng hủy nhóm cũ để tạo nhóm mới hoặc mời thêm thành viên');
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
    

    const secondStudent = students.find(s => s.code !== currentStudentCode);

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
    const departmentIds = students.map(s => s.department?.id);
    const uniqueDepartments = [...new Set(departmentIds)];
    if (uniqueDepartments.length > 1) {

      const departmentNames = [...new Set(students.map(s => s.department?.name || 'Không xác định'))];
      throw new Error(`Tất cả sinh viên phải cùng khoa. Đã phát hiện các khoa: ${departmentNames.join(', ')}`);
    }

    // Nếu user đã có nhóm nhưng chỉ 1 thành viên => update nhóm
    if (existGroup) {
      if (existGroup.total_member === 1) {
        existGroup.name = data.name || existGroup.name;
        existGroup.status = 'create';
        existGroup.total_member = 2;
        existGroup.student_attemp = students;
        return this.groupRepository.save(existGroup);
      } else {
        throw new Error('Nhóm đã đầy. Bạn không được mời thêm thành viên mới');
      }
    }
    const existGroupAttempt = await this.repository.manager.findOne(Group, {
      where: { students: { id: user.student.id }, status:'pending' },
      relations: ['leader'],
    });

    if (existGroupAttempt) {
      throw new Error('Bạn đã có nhóm. Vui lòng hủy nhóm cũ để tạo nhóm mới hoặc mời thêm thành viên');
    }
    // Tạo nhóm mới với 2 người
    const newGroup = new Group();
    newGroup.name = data.name;
    newGroup.student_attemp = students;
    newGroup.department = user.student.department;
    newGroup.leader = user.student;
     newGroup.students = [user.student]
    newGroup.code = `${radomcode1}${radomcode2}`;
    newGroup.total_member = 2;

    return this.groupRepository.save(newGroup);
  }

  // Nếu số lượng thành viên khác 1 hoặc 2 => không hỗ trợ
  throw new Error('Chỉ hỗ trợ tạo nhóm 1 hoặc 2 thành viên');
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



  async getGroupByUser(userId: number, type:string): Promise<any> {
    const user = await this.check_exist_with_data(User, {
      where: { id: userId },
      relations: ['student'],
    }, 'Tài khoản không hợp lệ');
    if (user?.student) {
      const student = await this.check_exist_with_data(Student, {
        where: { id: user?.student?.id },
        relations: { group: true },
      }, 'Sinh viên không tồn tại');
      let data:any = {}
      const group: any = await this.repository.manager.findOne(Group, {
        where: { id: student?.group?.id },
        relations: ['students', 'students.user','leader','leader.user','student_attemp','student_attemp.user'],
      });
      if (type === 'leader') {
        if (group && group?.status == 'create') {
          const groupDta = await this.repository.manager.findOne(Group, {
            where: { id: group.id , leader:{id: user?.student?.id}},
            relations: ['students', 'students.user','leader','leader.user','student_attemp','student_attemp.user'],
          });
          data =this.freshData(groupDta) ;
        } else {
          data = this.freshData(group);
        }
      } else if (type === 'invite') {
        // Lấy tất cả nhóm có user là 1 trong các student_attemp
            const groupHas = await this.repository.manager.find(Group, {
              where: {
                status: "create",
                student_attemp: {
                  id: user?.student?.id
                }
              },
              relations: [
                'students', 'students.user',
                'leader', 'leader.user',
                'student_attemp', 'student_attemp.user'
              ]
            });

            // Lọc ra những nhóm mà leader không phải là chính user
        const groupInvite = groupHas.filter(group => group.leader.id !== user?.student?.id);
        const freshGroupInvite = await Promise.all(groupInvite.map(group => this.freshData(group)));
          data= freshGroupInvite
        
      }
      
      
      return data ?? null; // Null = chưa có nhóm
    } else {
      throw new Error("Bạn không phải là sinh viên")
    }
    
   
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
    return data
  }

  async handleInviteResponse(userId: any, groupId: any, type: any) {
    const user = await this.check_exist_with_data(User, {
      where: { id: userId },
      relations: ['student'],
    }, 'Tài khoản không hợp lệ');
    if (user?.student) {
      var student = await this.check_exist_with_data(Student, {
        where: { id: user?.student?.id },
        relations: { group: true },
      }, 'Sinh viên không tồn tại');
    }
    const group = await this.check_exist_with_data(Group, {
      where: { id: groupId },
      relations: {leader: true},
    }, 'Nhóm không tồn tại')
    if (group?.leader && group?.leader?.code != user?.student.code && group?.status =='create') {
      const groupHas = await this.repository.manager.findOne(Group, {
            where: {
                id: group?.id,
                student_attemp: {
                  id: user?.student?.id
                }
              },
              relations: [
                'students', 'students.user',
                'leader', 'leader.user',
                'student_attemp', 'student_attemp.user'
              ]
      });
      if (groupHas) {
        if (type == 'accept') {
          if (student?.group) {
            throw new Error("Bạn đã có nhóm. Bạn cần hủy tham gia nhóm hiện tại để tham gia nhóm khác");
          }
          groupHas.status = 'pending';
          groupHas.total_member = 2;
          groupHas.students = [groupHas.leader,user?.student];
          return this.groupRepository.save(groupHas);
        } else {
          if (type == "reject") {
            groupHas.status = 'pending';
            groupHas.total_member = 1;
            groupHas.students = [groupHas.leader];
            groupHas.student_attemp = [groupHas.leader]
            return this.groupRepository.save(groupHas);
          }
        }
      
        
      }
      
    }
    else {
      throw new Error("Yêu cầu không hợp lệ");
    }

  }

}
