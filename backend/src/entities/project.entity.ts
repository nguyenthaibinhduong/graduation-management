import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { EnrollmentSession } from './enrollment_session.entity';
import { Committee } from './committee.entity';
import { Group } from './group.entity';
import { Score } from './score.entity';
import { Student } from './student.entity';
import { Course } from './course.entity';
import { on } from 'events';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.id, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Course, (course) => course.id)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToMany(() => Committee, (committee) => committee.projects)
  @JoinTable({ name: 'project_committees' })
  committees: Committee[];

  @OneToMany(() => Group, (group) => group.project)
  groups: Group[];

  @OneToOne(() => Score, (score) => score.project)
  score: Score;

  @Column({
    type: 'enum',
    enum: ['propose', 'pending', 'approve', 'public'],
    default: 'propose',
  })
  status: 'propose' | 'pending' | 'approve' | 'public';

  @Column({ type: 'int', default: 2 })
  max_total_group: number;

  //session_id
  @ManyToOne(() => EnrollmentSession, (session) => session.project)
  @JoinColumn({ name: 'enroll_session_id' })
  session: EnrollmentSession;

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản

  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
