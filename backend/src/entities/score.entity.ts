import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Project } from './project.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Group, (group) => group.score)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToOne(() => Project, (project) => project.id)
  project: Project;

  @Column({ type: 'double' })
  total_score: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;
}
