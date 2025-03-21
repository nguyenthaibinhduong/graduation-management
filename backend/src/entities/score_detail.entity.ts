import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Score } from './score.entity';
import { Student } from './student.entity';

@Entity('score_details')
export class ScoreDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Score, (score) => score.id)
  @JoinColumn({ name: 'score_id' })
  score: Score;

  @OneToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'double' })
  scoreValue: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;
}
