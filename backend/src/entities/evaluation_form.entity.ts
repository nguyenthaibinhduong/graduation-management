import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}
