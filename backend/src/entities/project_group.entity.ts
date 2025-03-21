import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from './project.entity';
import { Group } from './group.entity';

@Entity('projects_groups')
export class ProjectGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Project, (project) => project.id)
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToOne(() => Group, (group) => group.id)
  @JoinColumn({ name: 'group_id' })
  group: Group;
}
