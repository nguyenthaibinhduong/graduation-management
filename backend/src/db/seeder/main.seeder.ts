import { AppDataSource } from '../data-source';
import { User, UserRole } from 'src/entities/user.entity';
import { UserFactory } from '../factory/user.factory';
import { DepartmentFactory, MajorFactory } from '../factory/majors.factory';
import { Major } from 'src/entities/major.entity';
import { Department } from 'src/entities/department.entity';
import { Student } from 'src/entities/student.entity';
import {  StudentFactory } from '../factory/student.factory';
import { Position } from 'src/entities/position.entity';
import { PositionFactory } from '../factory/position.factory';
import { Course } from 'src/entities/course.entity';
import { CourseFactory } from '../factory/course.factory';
import { Teacher } from 'src/entities/teacher.entity';
import { TeacherFactory } from '../factory/teacher.factory';
export class MainSeeder {
  static async seed() {
    await AppDataSource.initialize();
    console.log('✅ Database connection established.');

    const userRepo = AppDataSource.getRepository(User);
    const majorRepo = AppDataSource.getRepository(Major);
    const departRepo = AppDataSource.getRepository(Department);
    const positionRepo = AppDataSource.getRepository(Position);
    const studRepo = AppDataSource.getRepository(Student);
    const teachRepo = AppDataSource.getRepository(Teacher);
    const courseRepo = AppDataSource.getRepository(Course);

    // Seed Positions
    const course = await CourseFactory.createCurrent();
    await courseRepo.save(course);
    console.log(`✅ Seeded 1 course.`);

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


    const teacherUsers = await userRepo.find({
      where: { role: UserRole.TEACHER },
    });
    const teachers = await TeacherFactory.createMany(
      teacherUsers,
      departments,
      positions
    );
    await teachRepo.save(teachers);
    console.log(`✅ Seeded ${teachers.length} students.`);
    await AppDataSource.destroy();
    console.log('🎉 Database seeding completed successfully!');
  }
}
