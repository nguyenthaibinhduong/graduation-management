import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Department } from './department.entity';
import { Course } from './course.entity';

@Entity('enrollment_session')
export class EnrollmentSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @Column()
  title: string;

  @Column()
  content: string;

  @OneToOne(() => Department, (department) => department.id)
  department: Department;

  @OneToOne(() => Course, (course) => course.id)
  course: Course;
}
