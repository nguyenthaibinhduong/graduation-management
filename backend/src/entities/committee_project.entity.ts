import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectGroup } from './project_group.entity';
import { Committee } from './committee.entity';

@Entity('committees_projects')
export class CommitteeProject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Committee, (committee) => committee.id)
  @JoinColumn({ name: 'committee_id' })
  committee: Committee;

  @ManyToOne(() => ProjectGroup, (projectGroup) => projectGroup.id)
  @JoinColumn({ name: 'project_group_id' })
  projectGroup: ProjectGroup;
}
