import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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


  @CreateDateColumn()
    created_at: Date; // Ngày tạo tài khoản
  
    @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
  
  @Column({ default: true })
  active: boolean;
}
