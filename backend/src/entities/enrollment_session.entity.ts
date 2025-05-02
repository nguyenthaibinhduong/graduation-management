import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Course } from './course.entity';
import { Project } from './project.entity';

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

  @ManyToOne(() => Department, (department) => department.enrollmentSessions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Course, (course) => course.enrollmentSessions, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

   @OneToMany(() => Project, (project) => project.session)
  project: Project[]

  @CreateDateColumn()
    created_at: Date; // Ngày tạo tài khoản
  
    @UpdateDateColumn()
    updated_at: Date; // Ngày cập nhật thông tin người dùng
}

