import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/common/base.service';
import { Roles } from 'src/common/decorators/roles.decorators';
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

  async createGroup(data: any, user_id: any): Promise<Group> {
    if (!data?.student_codes || data.student_codes.length === 0) {
      throw new Error('Không thể thêm nhóm mà không có sinh viên');
    }
    const user: any = await this.repository.manager.findOne(User, {
      where: { id: user_id },
      relations: ['student','student.department'] 
    })

    
     
    if (!data.student_codes.includes(user?.student?.code)) {
      throw new Error('Bạn chỉ được thêm nhóm có thông tin của bạn');
    }
    // Find students by their codes
    const students = await this.repository.manager.find(Student, {
      where: { code: In(data.student_codes) },
      relations: { department: true, group: true }, // Ensure department and group relations are loaded
    });
    const radomcode1 = Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');
    const radomcode2 = Math.floor(Math.random() * 999 + 1).toString().padStart(3, '0');
    // await this.check_exist_no_data(Group, {
    //   where:{ students: { code : In(data.student_codes)}}
    // },'Hai bạn đã có nhóm từ trước . Hãy kiểm tra lời mời trong danh sách')
    

    const existGroup = await this.repository.manager.findOne(Group, {
       where: { leader: { id: user?.student?.id } },
      relations: ['leader'],
    })
    console.log(existGroup);
    
    if (data.student_codes.length > 1) {
      if (data.student_codes?.[1] == user?.student?.code) {
          throw new Error(`Mã sinh viên ${data.student_codes?.[1]} không hợp lệ vì là mã sinh viên của bạn`  )
      }
      const existed = await this.repository.manager
        .createQueryBuilder(Group, 'group')
        .innerJoin('group.students', 'student')
        .where('student.code IN (:...codes)', { codes: data.student_codes })
        .getOne();

      if (existed) {
        throw new Error('Hai bạn đã có nhóm từ trước.');
      }
      const studentB = await this.repository.manager.find(Student, {
        where:{code : data.student_codes?.[1]}
      })
      if (!studentB) {
        throw new Error(`Mã sinh viên ${data.student_codes?.[1]} không hợp lệ`  )
      }

      const studentsWithGroup = studentB.filter((student) => student.group);
      if (studentsWithGroup.length > 0) {
        const studentCodes = studentsWithGroup.map((s) => s.code);
        throw new Error(
          `Sinh viên có mã ${data.student_codes?.[1]} sau đã có nhóm: `,
        );
      }

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

 
      if (existGroup) {
        if (existGroup.total_member == 1) {
          if (data.name) {
            existGroup.name = data.name;
          }
          existGroup.status = 'create';
          existGroup.total_member = students.length;
          existGroup.students = students
          return this.groupRepository.save(existGroup);
        } else {
           throw Error('Nhóm đã đầy. Bạn không được mời thêm thành viên mới. Vui lòng hủy nhóm cũ để tạo nhóm mới')
        }
        
      } else {
          const newGroup = new Group();
          newGroup.name = data.name;
          newGroup.students = students;
          newGroup.department =user?.student?.department
          newGroup.leader = user?.student;
          newGroup.code = `${radomcode1}${radomcode2}`;
          newGroup.total_member = students.length;
          return this.groupRepository.save(newGroup);
      }
      
     
    } else if (data.student_codes.length == 1) {
      if (existGroup) {
        throw Error('Bạn không được tạo nhóm mới. Vui lòng hủy nhóm cũ để tạo nhóm mới hoặc mời thêm thành viên')
      } else {
        const newGroup = new Group();
        newGroup.name = data.name;
        newGroup.students = students;
        newGroup.department = user?.student?.department
        newGroup.code = `${radomcode1}${radomcode2}`;
        newGroup.status = 'pending'
        newGroup.leader = user?.student;
        newGroup.total_member = 1;
        return this.groupRepository.save(newGroup);
      }
      
    }
    // Check if all provided student codes exist
    
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
  async getGroupByUserId(userId: number): Promise<any> {
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
        relations: ['students', 'students.user','leader','leader.user'],
      });
      if (group.status == 'create') {
        const groupDta = await this.repository.manager.findOne(Group, {
          where: { id: group.id , leader:{id: user?.student?.id}},
          relations: ['students', 'students.user','leader','leader.user'],
        });
        data = groupDta;
      } else {
        data = group;
      }

      if (data?.students) {
        data.students = data.students.map((student: any) => {
          return {
            ...student,
            user: {
              id: student.user?.id,
              fullname: student.user?.fullname,
            },
          };
        });
      }
      if (data?.students) {
        data.students = data.students.map((student: any) => {
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
        data.leader = {
          ...data.leader,
          user: {
            id: data.leader.user?.id,
            fullname: data.leader.user?.fullname,
          },
        };
      }
      return data ?? null; // Null = chưa có nhóm
    } else {
      throw new Error("Bạn không phải là sinh viên")
    }
    
   
  }
  async getListHistory(userId: number): Promise<any> {
    const user = await this.check_exist_with_data(User, {
        where: { id: userId},
        relations: ['student'],
      }, 'Tài khoản không hợp lệ');
    if (user?.student) {
        const student = await this.check_exist_with_data(Student, {
          where: { leader_id: user?.student?.id },
          relations: { group: true },
        }, 'Sinh viên không tồn tại');
      const group:any = await this.repository.manager.find(Group, {
          where: { id: student?.group?.id  },
        relations: ['students', 'students.user'],
          order: {
            created_at: 'DESC',
          },
      });
      
       return group ?? null; // Null = chưa có nhóm
    } else {
      throw new Error("Bạn không phải là sinh viên")
    }
}

}
