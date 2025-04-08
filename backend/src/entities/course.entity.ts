import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EnrollmentSession } from './enrollment_session.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;
  
  @OneToMany(() => EnrollmentSession, (enrollment) => enrollment.department)
  enrollmentSessions: EnrollmentSession[];
}
