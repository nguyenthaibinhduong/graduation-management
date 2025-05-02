import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Major } from './major.entity';
import { Department } from './department.entity';
import { Group } from './group.entity';

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

  @ManyToOne(() => Group, (group) => group.students, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'group_id' })
  group?: Group;

  @ManyToMany(() => Group, (group) => group.student_attemp,{ onDelete: 'CASCADE'})
  @JoinTable({ name: 'student_group_attempts' }) // đúng cú pháp
  group_attemp?: Group[];


  @OneToMany(() => Group, (group) => group.leader)
  leadGroups: Group[];


  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản
  
  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
