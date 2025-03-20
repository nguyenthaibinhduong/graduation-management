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

  @Column()
  code: string;

  @ManyToOne(() => Major, (major) => major.students)
  major: Major;

  @ManyToOne(() => Department, (department) => department.students)
  department: Department;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
