import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Project } from './project.entity';
import { Score } from './score.entity';
import { Department } from './department.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  code: string;



  @Column()
  total_member: number;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];

  @ManyToOne(() => Student, (student) => student.group, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leader_id' })
  leader: Student;

  @ManyToOne(() => Project, (project) => project.groups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => Department, (department) => department.group, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToOne(() => Score, (score) => score.id)
  score: Score;

  //Group status: pending, approved, rejected
  @Column({
    type: 'enum',
    enum: ['create','pending', 'approved', 'rejected'],
    default: 'create',
  })
  status: 'create' | 'pending' | 'approved' | 'rejected';
  

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản
  
  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
