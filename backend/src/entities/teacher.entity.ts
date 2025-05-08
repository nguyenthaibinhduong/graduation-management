import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Committee } from './committee.entity';
import { Position } from './position.entity';
import { Department } from './department.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number | string;

  @Column({ unique: true })
  code: string;

  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Committee, (committee) => committee.teachers, {
    cascade: true,
  })
  committees: Committee[];

  @ManyToMany(() => Position, (position) => position.teachers, {
    cascade: true,
  })
  @JoinTable({
    name: 'teacher_positions',
  })
  position: Position[];

  @ManyToOne(() => Department, (department) => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  degree: string;

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản

  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
