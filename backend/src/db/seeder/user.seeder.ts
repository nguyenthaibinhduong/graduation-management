import { AppDataSource } from '../data-source';
import { User } from 'src/entities/user.entity';
import { UserFactory } from '../factory/user.factory';
export class UserSeeder {
  static async seed() {
    // await AppDataSource.initialize();
    // const userRepo = AppDataSource.getRepository(User);

    // // Tạo 10 users giả mạo
    // const users = await UserFactory.createMany(15);
    // await userRepo.save(users);

    // console.log('User seeding completed!');
    // await AppDataSource.destroy();
  }
}
