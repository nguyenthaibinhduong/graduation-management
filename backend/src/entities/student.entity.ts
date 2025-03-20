import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Major } from './major.entity';
import { Department } from './department.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // Mã sinh viên

  @ManyToOne(() => Major, (major) => major.students)
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @ManyToOne(() => Department, (department) => department.students)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
