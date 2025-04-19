import { AppDataSource } from '../data-source';
import { User, UserRole } from 'src/entities/user.entity';
import { UserFactory } from '../factory/user.factory';
import { DepartmentFactory, MajorFactory } from '../factory/majors.factory';
import { Major } from 'src/entities/major.entity';
import { Department } from 'src/entities/department.entity';
import { Student } from 'src/entities/student.entity';
import {
  GroupFactory,
  StudentFactory,
  StudentGroupFactory,
} from '../factory/student.factory';
import { Position } from 'src/entities/position.entity';
import { PositionFactory } from '../factory/position.factory';
import { Group } from 'src/entities/group.entity';
export class MainSeeder {
  static async seed() {
    await AppDataSource.initialize();
    console.log('✅ Database connection established.');

    const userRepo = AppDataSource.getRepository(User);
    const majorRepo = AppDataSource.getRepository(Major);
    const departRepo = AppDataSource.getRepository(Department);
    const positionRepo = AppDataSource.getRepository(Position);
    const studRepo = AppDataSource.getRepository(Student);
    const groupRepo = AppDataSource.getRepository(Group);

    // Seed Positions
    const positions = await PositionFactory.createMany();
    await positionRepo.save(positions);
    console.log(`✅ Seeded ${positions.length} positions.`);

    // Seed Departments
    const departments = await DepartmentFactory.createMany();
    await departRepo.save(departments);
    console.log(`✅ Seeded ${departments.length} departments.`);

    // Seed Majors
    const majors = await MajorFactory.createMany(departments);
    await majorRepo.save(majors);
    console.log(`✅ Seeded ${majors.length} majors.`);

    // Seed Users
    const users = await UserFactory.createMany(15);
    await userRepo.save(users);
    console.log(`✅ Seeded ${users.length} users.`);

    // Get Students (Users with role = "student")
    const studentUsers = await userRepo.find({
      where: { role: UserRole.STUDENT },
    });
    console.log(`📌 Found ${studentUsers.length} users with role 'student'.`);

    // Seed Students
    const students = await StudentFactory.createMany(
      studentUsers,
      departments,
      majors,
    );
    await studRepo.save(students);
    console.log(`✅ Seeded ${students.length} students.`);

    // Seed Groups
    const groups = await GroupFactory.createMany(5);
    await groupRepo.save(groups);
    console.log(`✅ Seeded ${groups.length} groups.`);

    // Fetch Students
    const student = await studRepo.find({ relations: ['groups'] });
    console.log(`📌 Found ${student.length} students.`);

    // Fetch Groups
    const group = await groupRepo.find({ relations: ['students'] });
    console.log(`📌 Found ${group.length} groups.`);

    // Seed Student-Group Relationships
    const studentGroups = StudentGroupFactory.createMany(groups, students);

    for (const { group, students: assignedStudents } of studentGroups) {
      group.students = assignedStudents;
      await groupRepo.save(group);
    }
    console.log('✅ Seeded student-group relationships.');

    await AppDataSource.destroy();
    console.log('🎉 Database seeding completed successfully!');
  }
}
