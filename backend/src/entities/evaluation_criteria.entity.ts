import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { EvaluationForm } from './evaluation_form.entity';
import { Criteria } from './criteria.entity';

@Entity('evaluation_criterias')
export class EvaluationCriteria {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => EvaluationForm, (evaluationForm) => evaluationForm.id)
  @JoinColumn({ name: 'evaluation_id' })
  evaluationForm: EvaluationForm;

  @ManyToOne(() => Criteria, (criteria) => criteria.id)
  @JoinColumn({ name: 'criteria_id' })
  criteria: Criteria;
}
