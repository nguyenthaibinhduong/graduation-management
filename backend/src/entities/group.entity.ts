import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { Project } from './project.entity';
import { Score } from './score.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  total_member: number;

  @OneToMany(() => Student, (student) => student.group)
  students: Student[];

  @ManyToOne(() => Project, (project) => project.groups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @OneToOne(() => Score, (score) => score.id)
  score: Score;
}
