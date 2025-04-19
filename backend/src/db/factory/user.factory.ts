import { User, UserRole } from 'src/entities/user.entity';
import { fakerVI as faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';

export class UserFactory {
  static async create(role?: UserRole): Promise<Partial<User>> {
    return {
      email: faker.internet.email(),
      username: String(faker.number.bigInt({ min: 1000000, max: 9999999 })),
      fullname: faker.person.fullName(),
      birth_date: faker.date.past(),
      address: '',
      phone: faker.phone.number(),
      password: await bcrypt.hash('password', 10),
      role:
        role ??
        faker.helpers.arrayElement([
          UserRole.STUDENT,
          UserRole.TEACHER,
          UserRole.ADMIN,
        ]),
      created_at: new Date(),
      avatar: faker.image.avatar(),
      updated_at: new Date(),
    };
  }

  static async createMany(count: number): Promise<Partial<User>[]> {
    const roles = [
      ...Array(5).fill(UserRole.STUDENT),
      ...Array(5).fill(UserRole.TEACHER),
      ...Array(count - 10).fill(UserRole.ADMIN),
    ];
    return Promise.all(roles.map((role) => this.create(role)));
  }
}
