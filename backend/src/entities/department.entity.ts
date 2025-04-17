import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student.entity';
import { Major } from './major.entity';
import { EnrollmentSession } from './enrollment_session.entity';
import { Teacher } from './teacher.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  code: string;

  @Column()
  name: string;

  @OneToMany(() => Student, (student) => student.department)
  students: Student[];

  @OneToMany(() => Teacher, (teacher) => teacher.department)
  teachers: Teacher[];

  @OneToMany(() => Major, (major) => major.department)
  major: Major[];
  
  @OneToMany(() => EnrollmentSession, (enrollment) => enrollment.department)
enrollmentSessions: EnrollmentSession[];
}
