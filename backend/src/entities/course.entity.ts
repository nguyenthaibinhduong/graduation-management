import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
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

  @Column({ type: 'boolean', default: false })
  is_current: boolean;

  
  @OneToMany(() => EnrollmentSession, (enrollment) => enrollment.department)
  enrollmentSessions: EnrollmentSession[];

  @CreateDateColumn()
    created_at: Date; // Ngày tạo tài khoản
  
    @UpdateDateColumn()
    updated_at: Date; // Ngày cập nhật thông tin người dùng
}
