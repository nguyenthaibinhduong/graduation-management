import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Teacher } from './teacher.entity';
import { Committee } from './committee.entity';

@Entity('comittees_teachers')
export class CommitteeTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Committee, (comittee) => comittee.id)
  @JoinColumn({ name: 'comittee_id' })
  comittee: Committee;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
