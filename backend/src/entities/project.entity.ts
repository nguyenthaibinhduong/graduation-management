import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './teacher.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  content: string;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  teacher: Teacher;

  @Column({
    type: 'enum',
    enum: ['process', 'pending', 'approve'],
    default: 'pending',
  })
  status: 'process' | 'pending' | 'approve';

  @Column()
  max_total_group: number;

  //session_id
}
