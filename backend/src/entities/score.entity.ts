import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Project } from './project.entity';
import { Student } from './student.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  // If exists, this is a GROUP SCORE
  @OneToOne(() => Group, (group) => group.score)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  // If exists, this is a STUDENT SCORE
  @OneToOne(() => Student, (student) => student.id, { nullable: true })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @OneToOne(() => Project, (project) => project.id)
  project: Project;

  @Column({ type: 'double', nullable: true })
  total_score?: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
