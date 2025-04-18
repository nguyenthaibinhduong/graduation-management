import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToMany(() => EvaluationForm, (evaluationForm) => evaluationForm.criteria)
  evaluationForms: EvaluationForm[];
}
