import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { EnrollmentSession } from './enrollment_session.entity';

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
  teacher: Teacher;

  @Column({
    type: 'enum',
    enum: ['process', 'pending', 'approve'],
    default: 'pending',
  })
  status: 'process' | 'pending' | 'approve';

  @Column({ type: 'int' })
  max_total_group: number;

  //session_id
  @OneToOne(
    () => EnrollmentSession,
    (enrollmentSession) => enrollmentSession.id,
  )
  @JoinColumn({ name: 'enroll_session_id' })
  session: EnrollmentSession;
}
