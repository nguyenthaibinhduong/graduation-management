import { DataSource } from 'typeorm';
import { StudentFactory } from '../factory/student.factory'; // Đảm bảo rằng bạn đã import đúng StudentFactory
import { AppDataSource } from '../data-source';
import { Student } from 'src/entities/student.entity';

export class StudentSeeder {
  static async seed() {
    await AppDataSource.initialize();
    const studentRepo = AppDataSource.getRepository(Student);

    // Tạo 10 users giả mạo
    // const users = await StudentFactory.createMany(5);
    // await studentRepo.save(users);

    // console.log('Student seeding completed!');
    // await AppDataSource.destroy();
  }
}
