import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Criteria } from './criteria.entity';

@Entity('evaluation_froms')
export class EvaluationForm {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ['blocked', 'active'],
    default: 'active',
  })
  status: 'blocked' | 'active';

  @ManyToMany(() => Criteria, (criteria) => criteria.evaluationForms)
  @JoinTable({ name: 'evaluation_criterias' })
  criteria: Criteria[];
}
