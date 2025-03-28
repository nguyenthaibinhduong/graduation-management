import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Major } from './major.entity';
import { Teacher } from './teacher.entity';

@Entity('positions')
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => Department, (department) => department.id)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Major, (major) => major.id)
  @JoinColumn({ name: 'major_id' })
  major: Major;

  @ManyToMany(() => Teacher, (teacher) => teacher.position)
  teachers: Teacher[];
}
