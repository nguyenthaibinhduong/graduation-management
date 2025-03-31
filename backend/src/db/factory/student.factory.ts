import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { Department } from 'src/entities/department.entity';
import { Major } from 'src/entities/major.entity';

export class StudentFactory {
  static createMany(users: User[], departments: Department[], majors: Major[]): Student[] {
    return users.map((user) => {
      const student = new Student();
      student.code = user.username; // Lấy mã sinh viên từ username của User
      student.user = user;
      student.department = departments[Math.floor(Math.random() * departments.length)];
      student.major = majors[Math.floor(Math.random() * majors.length)];
      return student;
    });
  }
}
