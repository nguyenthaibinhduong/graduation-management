import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectGroup } from './project_group.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => ProjectGroup, (projectGroup) => projectGroup.id)
  @JoinColumn({ name: 'project_group_id' })
  projectGroup: ProjectGroup;

  @Column({ type: 'double' })
  total_score: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;
}
