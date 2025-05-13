import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EvaluationForm } from './evaluation_form.entity';

@Entity('criteria')
export class Criteria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'double' })
  max_score: number;

  @Column({ type: 'double' })
  step: number;

  @Column({ type: 'double' })
  weightPercent: number;

  @ManyToMany(() => EvaluationForm, (evaluationForm) => evaluationForm.criteria)
  evaluationForms: EvaluationForm[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
