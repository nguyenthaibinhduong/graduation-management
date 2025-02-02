import { User, UserRole } from 'src/entities/user.entity';
import { fakerVI as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export class UserFactory {
  static async create(): Promise<Partial<User>> {
    // const password = faker.internet.password();
    const hashedPassword = await bcrypt.hash('password', 10);

    const roles = [UserRole.STUDENT, UserRole.TEACHER, UserRole.ADMIN];
    const randomRole = faker.helpers.arrayElement(roles); // Randomly select a role
    return {
      email: faker.internet.email(),
      password: hashedPassword,
      role: randomRole,
      created_at: faker.date.past(),
      updated_at: faker.date.recent(),
    };
  }

  static async createMany(count: number): Promise<Partial<User>[]> {
    const users: Partial<User>[] = [];
    for (let i = 0; i < count; i++) {
      const user = await this.create();
      if (i < 5) {
        user.role = UserRole.STUDENT; // Set role to STUDENT
      } else if (i >= 5 && i < 10) {
        user.role = UserRole.TEACHER; // Set role to TEACHER
      } else {
        user.role = UserRole.ADMIN; // Set role to ADMIN
      }
      users.push(user);
    }
    return users;
  }
}
