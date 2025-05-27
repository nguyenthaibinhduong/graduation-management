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
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Committee } from './committee.entity';
import { Position } from './position.entity';
import { Department } from './department.entity';
import { Group } from './group.entity';
import { Project } from './project.entity';

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
    onDelete: 'CASCADE',
  })
  committees: Committee[];

  @ManyToMany(() => Position, (position) => position.teachers, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'teacher_positions',
  })
  position: Position[];

  @ManyToOne(() => Department, (department) => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => Project, (project) => project.teacher)
  projects: Project[];


  //Giao vien phan bien
  @ManyToMany(() => Group, (group) => group.facultyReviewers)
  @JoinTable({
    name: 'faculty_reviewers',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  facultyReviewGroups?: Group[];

  @Column()
  degree: string;

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản

  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
  
  @DeleteDateColumn()
  deleted_at?: Date;

  @Column({ default: true })
  active: boolean;


}
