import { Teacher } from 'src/entities/teacher.entity';
import { Department } from 'src/entities/department.entity';
import { Position } from 'src/entities/position.entity';
import { Committee } from 'src/entities/committee.entity';
import { User, UserRole } from 'src/entities/user.entity';
import { fakerVI as faker } from '@faker-js/faker'; // Giả sử bạn có sẵn UserFactory

export class TeacherFactory {
  static async create(
    user: User,
    department: Department,
    positions?: Position[],
  ): Promise<Partial<Teacher>> {
    return {
      code: faker.string.alphanumeric(8).toUpperCase(),
      user: user,
      department: department,
      degree: faker.helpers.arrayElement(['Thạc sĩ', 'Tiến sĩ', 'Giáo sư']),
      position: positions ?? [],
      committees: [],
      created_at: new Date(),
      updated_at: new Date(),
    };
  }

  static async createMany(
    users: User[],
    departments: Department[],
    positions: Position[] = [],
  ): Promise<Partial<Teacher>[]> {
    const teachers: Partial<Teacher>[] = [];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const department = faker.helpers.arrayElement(departments);
      const assignedPositions = faker.helpers.arrayElements(positions, 1);

      const teacher = await this.create(
        user,
        department,
        assignedPositions,
      );
      teachers.push(teacher);
    }

    return teachers;
  }
}
