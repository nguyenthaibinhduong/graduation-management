import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { Department } from './department.entity';
import { EvaluationForm } from './evaluation_form.entity';
import { Project } from './project.entity';
import { Teacher } from './teacher.entity';

@Entity('committees')
export class Committee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Course, (course) => course.id)
  @JoinColumn({ name: 'course_id' })
  course?: Course;

  @ManyToOne(() => Department, (department) => department.id)
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  @ManyToMany(() => Project, (project) => project.id)
  project?: Project[];

  @ManyToMany(() => Teacher, (teacher) => teacher.id)
  teacher: Teacher[];

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  content: string;

  @Column({ type: 'int' })
  total_teacher: number;

  @Column({ type: 'int' })
  total_project: number;

  @Column({ type: 'datetime' })
  time_start: Date;

  @Column({ type: 'datetime' })
  time_end: Date;

  @Column({ type: 'enum', enum: ['blocked', 'active'], default: 'active' })
  status: 'blocked' | 'active';

  @ManyToOne(() => EvaluationForm, (evaluationForm) => evaluationForm.id)
  @JoinColumn({ name: 'evaluation_id' })
  evaluationForm?: EvaluationForm;
}
