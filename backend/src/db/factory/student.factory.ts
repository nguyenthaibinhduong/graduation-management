import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { Department } from 'src/entities/department.entity';
import { Major } from 'src/entities/major.entity';
import { Group } from 'src/entities/group.entity';
import { fakerVI as faker } from '@faker-js/faker';

export class StudentFactory {
  static createMany(
    users: User[],
    departments: Department[],
    majors: Major[],
  ): Student[] {
    return users.map((user) => {
      const student = new Student();
      student.code = user.username; // Lấy mã sinh viên từ username của User
      student.user = user;
      student.group = null; // Chưa có nhóm
      student.department =
        departments[Math.floor(Math.random() * departments.length)];
      student.major = majors[Math.floor(Math.random() * majors.length)];
      return student;
    });
  }
}

export class GroupFactory {
  static create(totalMember: number): Group {
    const group = new Group();
    group.name = faker.company.name();
    group.total_member = totalMember;
    return group;
  }

  static createMany(count: number): Group[] {
    return Array.from({ length: count }).map(() => {
      const totalMember = faker.number.int({ min: 2, max: 4 });
      return this.create(totalMember);
    });
  }
}
