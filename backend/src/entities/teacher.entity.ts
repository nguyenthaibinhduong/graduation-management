import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Committee } from './committee.entity';
import { Position } from './position.entity';
import { Department } from './department.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @OneToOne(() => User, (user) => user.teacher)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Committee, (committee) => committee.id)
  @JoinTable({
    name: 'teacher_committees',
  })
  committee: Committee[];

  @ManyToMany(() => Position, (position) => position.teachers)
  @JoinTable({
    name: 'teacher_positions',
  })
  position: Position[];

  @ManyToOne(() => Department, (department) => department.teachers)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column()
  degree: string;
}
