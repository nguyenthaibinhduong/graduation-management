import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Score } from './score.entity';
import { Student } from './student.entity';
import { Teacher } from './teacher.entity';
import { Criteria } from './criteria.entity';

@Entity('score_details')
export class ScoreDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Score, (score) => score.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'score_id' })
  score: Score;

  @ManyToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Teacher, (teacher) => teacher.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @ManyToOne(() => Criteria, (criteria) => criteria.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'criteria_id' })
  criteria: Criteria;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  teacherType: 'advisor' | 'reviewer' | 'committee';

  @Column({ type: 'double' })
  scoreValue: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;

  @Column({ default: true })
  isLocked: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
