import { Student } from 'src/entities/student.entity';
import { fakerVI as faker } from '@faker-js/faker';
import { User } from 'src/entities/user.entity';
import { AppDataSource } from '../data-source';

export class StudentFactory {
  static async create(index: number): Promise<Partial<Student>> {
    const userRepository = AppDataSource.getRepository(User);
    // Lọc người dùng có role là 'student'
    const users = await userRepository
      .createQueryBuilder('users')
      .where('users.role = :role', { role: 'student' }) // Lọc người dùng có role là 'student'
      .orderBy('users.id', 'ASC') // Sắp xếp theo id (hoặc bạn có thể thay bằng trường khác)
      .limit(5) // Lấy 5 bản ghi đầu tiên
      .getMany(); // Sử dụng getMany để lấy một mảng các bản ghi

    // Kiểm tra xem có dữ liệu không
    if (users.length === 0) {
      throw new Error(
        'No users with role "student" found to assign to students',
      );
    }
    return null; //Xoa dong nay khi chay seed
    // return {
    //   name: faker.person.fullName(),
    //   student_code: faker.string.uuid(), // Sử dụng uuid cho student_code
    //   date_of_birth: faker.date.past(), // Sinh nhật ngẫu nhiên
    //   major: faker.helpers.arrayElement([
    //     'Khoa học máy tính',
    //     'Cơ điện tử',
    //     'Tài chính',
    //     'Kinh tế',
    //     'Kế toán',
    //   ]), // Ngành học ngẫu nhiên
    //   enrollment_year: faker.number.int({ min: 2015, max: 2025 }),
    //   user: users[index], // Năm nhập học ngẫu nhiên
    // };
  }

  static async createMany(count: number): Promise<Partial<Student>[]> {
    const students: Partial<Student>[] = [];
    for (let i = 0; i < count; i++) {
      const student = await this.create(i);
      students.push(student);
    }
    return students;
  }
}
