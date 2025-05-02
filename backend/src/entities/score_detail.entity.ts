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

@Entity('score_details')
export class ScoreDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Score, (score) => score.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'score_id' })
  score: Score;

  @OneToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ type: 'double' })
  scoreValue: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản
  
  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
