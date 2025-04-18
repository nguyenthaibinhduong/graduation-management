import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { EnrollmentSession } from './enrollment_session.entity';
import { Committee } from './committee.entity';
import { Group } from './group.entity';
import { Score } from './score.entity';
import { Student } from './student.entity';
import { Course } from './course.entity';

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

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;

   @ManyToOne(() => Course, (course) => course.id)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToMany(() => Committee, (committee) => committee.id)
  @JoinTable({ name: 'project_committees' })
  committee: Committee[];

  @ManyToMany(() => Group, (group) => group.id)
  @JoinTable({ name: 'project_groups' })
  groups: Group[];

  @OneToOne(() => Score, (score) => score.project)
  score: Score;

  @Column({
    type: 'enum',
    enum: ['propose', 'pending', 'approve'],
    default: 'pending',
  })
  status: 'propose' | 'pending' | 'approve';

  @Column({ type: 'int', default: 2 })
  max_total_group: number;


  //session_id
  @OneToOne(
    () => EnrollmentSession,
    (enrollmentSession) => enrollmentSession.id,
  )
  @JoinColumn({ name: 'enroll_session_id' })
  session: EnrollmentSession;
}
