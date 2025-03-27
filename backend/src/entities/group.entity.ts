import { Column, Entity, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @ManyToMany(() => Student, (student) => student.id)
  students: Student[];

  @ManyToMany(() => Project, (project) => project.id)
  projects: Project[];

  @OneToOne(() => Score, (score) => score.id)
  score: Score;
}
